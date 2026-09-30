import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ClubMark } from '../../components/clubs/ClubCard.jsx';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { Panel, PanelBody, PanelHeader } from '../../components/ui/Panel.jsx';
import {
  Alert,
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { clubService } from '../../services/index.js';
import { NotImplementedError } from '../../services/errors.js';
import { CLUB_CATEGORIES } from '../../utils/constants.js';

/** The clubs this administrator owns, and the form that creates a new one. */
export function ManageClubsPage() {
  const toast = useToast();
  const [creating, setCreating] = useState(false);

  const clubs = useAsync(() => clubService.listAdminClubs(), []);
  const coordinators = useAsync(() => clubService.listCoordinators(), []);

  const rows = clubs.data ?? [];

  return (
    <>
      <PageHeader
        title="My clubs"
        description="Clubs you administer. Open one to review its membership requests."
        actions={
          <Button
            variant={creating ? 'secondary' : 'primary'}
            icon={creating ? undefined : 'plus'}
            onClick={() => setCreating((value) => !value)}
          >
            {creating ? 'Close' : 'New club'}
          </Button>
        }
      />

      {creating ? (
        <Panel style={{ marginBottom: 'var(--sp-5)' }}>
          <PanelHeader title="Create a club" />
          <PanelBody>
            <CreateClubForm
              coordinators={coordinators}
              onCreated={(club) => {
                toast.success(
                  `${club?.name ?? 'The club'} was created and is awaiting approval.`,
                );
                setCreating(false);
                clubs.refetch();
              }}
              onCancel={() => setCreating(false)}
            />
          </PanelBody>
        </Panel>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={clubs.loading}
          error={clubs.error}
          onRetry={clubs.refetch}
          skeleton={<ListSkeleton rows={3} />}
          isEmpty={rows.length === 0}
          empty={
            <EmptyState
              icon="clubs"
              title="You do not administer any clubs"
              description="Create a club to start accepting members and organising events."
              action={
                <Button variant="primary" onClick={() => setCreating(true)}>
                  Create a club
                </Button>
              }
            />
          }
        >
          <div className="record-list">
            {rows.map((club) => (
              <div className="record" key={club.id}>
                <ClubMark club={club} />

                <div className="record__body">
                  <p className="record__title">
                    <Link to={`/club-admin/clubs/${club.id}/members`}>
                      {club.name}
                    </Link>
                  </p>
                  <p className="record__meta">
                    <span>{club.category}</span>
                    <span className="record__meta-sep">
                      {club.member_count} members
                    </span>
                    {club.pending_count > 0 ? (
                      <span className="record__meta-sep">
                        {club.pending_count} awaiting review
                      </span>
                    ) : null}
                  </p>
                  {club.description ? (
                    <p className="record__excerpt">{club.description}</p>
                  ) : null}
                </div>

                <div className="record__aside row-wrap">
                  <Button size="sm" to={`/club-admin/clubs/${club.id}/members`}>
                    Members
                  </Button>
                  <Button size="sm" variant="ghost" to={`/app/clubs/${club.id}`}>
                    Public page
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}

/**
 * POST /api/clubs.
 *
 * The documented body is { name, description }. The Express controller in this
 * repository additionally requires `category` and `faculty_coordinator_id`, so
 * both are collected and sent when available — a backend that ignores them is
 * unaffected, and one that needs them succeeds. See BACKEND_INTEGRATION.md.
 */
function CreateClubForm({ coordinators, onCreated, onCancel }) {
  const toast = useToast();
  const [values, setValues] = useState({
    name: '',
    description: '',
    category: CLUB_CATEGORIES[0],
    faculty_coordinator_id: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const coordinatorsUnavailable =
    coordinators.error instanceof NotImplementedError;

  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  };

  const submit = async (event) => {
    event.preventDefault();

    const next = {};
    if (!values.name.trim()) next.name = 'A club name is required.';
    if (!values.category) next.category = 'Choose a category.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const club = await clubService.createClub({
        name: values.name.trim(),
        description: values.description.trim() || null,
        category: values.category,
        ...(values.faculty_coordinator_id
          ? { faculty_coordinator_id: Number(values.faculty_coordinator_id) }
          : {}),
      });
      onCreated(club);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="stack" onSubmit={submit} noValidate>
      <div className="form-grid">
        <Field label="Club name" required error={errors.name}>
          {(a11y) => (
            <Input
              {...a11y}
              name="name"
              value={values.name}
              onChange={update}
              placeholder="e.g. AI and Innovation Club"
            />
          )}
        </Field>

        <Field label="Category" required error={errors.category}>
          {(a11y) => (
            <Select
              {...a11y}
              name="category"
              value={values.category}
              onChange={update}
            >
              {CLUB_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field label="Description">
        {(a11y) => (
          <Textarea
            {...a11y}
            name="description"
            rows={3}
            value={values.description}
            onChange={update}
            placeholder="What does this club do?"
          />
        )}
      </Field>

      {coordinatorsUnavailable ? (
        <Alert tone="info" title="Faculty coordinator cannot be selected">
          {coordinators.error.note} The club will be created without one; if the
          backend requires it, the request will be rejected and the reason shown.
        </Alert>
      ) : (
        <Field
          label="Faculty coordinator"
          hint="The faculty member who will approve this club's events."
        >
          {(a11y) => (
            <Select
              {...a11y}
              name="faculty_coordinator_id"
              value={values.faculty_coordinator_id}
              onChange={update}
              disabled={coordinators.loading}
            >
              <option value="">
                {coordinators.loading ? 'Loading…' : 'Not assigned'}
              </option>
              {(coordinators.data ?? []).map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      )}

      <div className="row-wrap">
        <Button type="submit" variant="primary" loading={submitting}>
          Create club
        </Button>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
