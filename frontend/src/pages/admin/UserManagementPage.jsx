
import { useMemo, useState } from 'react';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { FilterSelect, SearchInput } from '../../components/ui/Toolbar.jsx';
import { useAsync, useDebouncedValue } from '../../hooks/index.js';
import { userService } from '../../services/index.js';
import { ROLE_LABELS, ROLES } from '../../utils/constants.js';
import { formatDate, initials } from '../../utils/format.js';

import '../../styles/user-management.css';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...Object.values(ROLES).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
];

function SummaryCard({ label, value, detail, icon, featured = false }) {
  return (
    <div className={`accounts-stat${featured ? ' accounts-stat--featured' : ''}`}>
      <div className="accounts-stat__top">
        <span className="accounts-stat__label">{label}</span>
        <span className="accounts-stat__icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="accounts-stat__value">{value}</p>
      <p className="accounts-stat__detail">{detail}</p>
    </div>
  );
}

export function UserManagementPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES.FACULTY_COORDINATOR);

  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(true);

  const search = useDebouncedValue(query, 200);
  const users = useAsync(() => userService.listUsers(), []);

  const allUsers = users.data ?? [];

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return allUsers.filter((user) => {
      if (role !== 'all' && user.role !== role) return false;
      if (!term) return true;

      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [allUsers, search, role]);

  const total = allUsers.length;
  const studentCount = allUsers.filter(
    (user) => user.role === ROLES.STUDENT,
  ).length;
  const clubAdminCount = allUsers.filter(
    (user) => user.role === ROLES.CLUB_ADMIN,
  ).length;
  const staffCount = allUsers.filter((user) =>
    [
      ROLES.FACULTY_COORDINATOR,
      ROLES.SYSTEM_ADMIN,
    ].includes(user.role),
  ).length;

  async function handleCreateUser(event) {
    event.preventDefault();

    setSaving(true);
    setNotice('');
    setFormError('');

    if (password.length < 8) {
      setFormError('The temporary password must contain at least 8 characters.');
      setSaving(false);
      return;
    }

    try {
      await userService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: newRole,
      });

      setNotice('Account created successfully.');
      setName('');
      setEmail('');
      setPassword('');
      setNewRole(ROLES.FACULTY_COORDINATOR);

      await users.refetch();
    } catch (error) {
      setFormError(error.message || 'Unable to create account.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    setNotice('');
    setFormError('');

    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setResetSaving(true);

    try {
      const result = await userService.resetUserPassword(resetUserId, {
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setNotice(result.message || 'Password reset successfully.');
      setResetUserId(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setFormError(error.message || 'Unable to reset password.');
    } finally {
      setResetSaving(false);
    }
  }

  function openResetForm(userId) {
    setResetUserId(userId);
    setNewPassword('');
    setConfirmPassword('');
    setNotice('');
    setFormError('');
  }

  function closeResetForm() {
    setResetUserId(null);
    setNewPassword('');
    setConfirmPassword('');
    setFormError('');
  }

  return (
    <div className="accounts-page">
      <PageHeader
        title="Accounts"
        description="Manage your campus community, create accounts and keep access secure."
      />

      <section className="accounts-overview" aria-label="Account overview">
        <SummaryCard
          label="Total accounts"
          value={users.loading && !users.data ? '—' : total}
          detail="Across all account roles"
          icon="◎"
          featured
        />
        <SummaryCard
          label="Students"
          value={users.loading && !users.data ? '—' : studentCount}
          detail="Student accounts"
          icon="◉"
        />
        <SummaryCard
          label="Club administrators"
          value={users.loading && !users.data ? '—' : clubAdminCount}
          detail="Managing campus clubs"
          icon="◇"
        />
        <SummaryCard
          label="Faculty & system admins"
          value={users.loading && !users.data ? '—' : staffCount}
          detail="Coordinator and admin roles"
          icon="▤"
        />
      </section>

      <Panel>
        <section className="accounts-create">
          <div className="accounts-section-heading">
            <div className="accounts-section-heading__copy">
              <span className="accounts-eyebrow">ACCOUNT SETUP</span>
              <h2>Create a new account</h2>
              <p>
                Give a campus member access to CampusOS with the appropriate role.
              </p>
            </div>

            <Button
              variant="secondary"
              icon={showCreateForm ? 'chevron-up' : 'chevron-down'}
              onClick={() => setShowCreateForm((shown) => !shown)}
              aria-expanded={showCreateForm}
            >
              {showCreateForm ? 'Collapse' : 'Create account'}
            </Button>
          </div>

          {showCreateForm && (
            <form className="accounts-form" onSubmit={handleCreateUser}>
              <div className="accounts-form__grid">
                <label className="accounts-field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    maxLength={100}
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="accounts-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@college.edu"
                    maxLength={150}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="accounts-field">
                  <span>Temporary password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <small>Use at least 8 characters.</small>
                </label>

                <label className="accounts-field">
                  <span>Account role</span>
                  <select
                    value={newRole}
                    onChange={(event) => setNewRole(event.target.value)}
                    required
                  >
                    {Object.values(ROLES).map((item) => (
                      <option key={item} value={item}>
                        {ROLE_LABELS[item] ?? item}
                      </option>
                    ))}
                  </select>
                  <small>Choose the access level for this account.</small>
                </label>
              </div>

              <div className="accounts-form__footer">
                <p>All fields are required.</p>
                <Button
                  type="submit"
                  variant="primary"
                  icon="user-plus"
                  loading={saving}
                >
                  {saving ? 'Creating account...' : 'Create account'}
                </Button>
              </div>
            </form>
          )}
        </section>
      </Panel>

      {notice && (
        <div className="accounts-alert accounts-alert--success" role="status">
          <span aria-hidden="true">✓</span>
          <p>{notice}</p>
          <button
            type="button"
            aria-label="Dismiss success message"
            onClick={() => setNotice('')}
          >
            ×
          </button>
        </div>
      )}

      {formError && (
        <div className="accounts-alert accounts-alert--error" role="alert">
          <span aria-hidden="true">!</span>
          <p>{formError}</p>
          <button
            type="button"
            aria-label="Dismiss error message"
            onClick={() => setFormError('')}
          >
            ×
          </button>
        </div>
      )}

      <section className="accounts-directory">
        <div className="accounts-section-heading accounts-directory__heading">
          <div className="accounts-section-heading__copy">
            <span className="accounts-eyebrow">CAMPUS DIRECTORY</span>
            <h2>All accounts</h2>
            <p>Find a member, check their role and manage account passwords.</p>
          </div>

          <span className="accounts-total-pill">
            {visible.length} {visible.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="accounts-toolbar">
          <div className="accounts-toolbar__search">
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search accounts"
              placeholder="Search by name or email..."
              className="spacer"
            />
          </div>

          <div className="accounts-toolbar__filter">
            <FilterSelect
              label="Filter by role"
              value={role}
              onChange={setRole}
              options={ROLE_OPTIONS}
            />
          </div>

          {(query || role !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              icon="x"
              onClick={() => {
                setQuery('');
                setRole('all');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        <Panel flush>
          <AsyncSection
            loading={users.loading}
            error={users.error}
            onRetry={users.refetch}
            skeleton={<ListSkeleton rows={5} />}
            isEmpty={visible.length === 0}
            empty={
              total === 0 ? (
                <EmptyState
                  icon="users"
                  title="No accounts yet"
                  description="Create your first account using the form above."
                />
              ) : (
                <EmptyState
                  icon="search"
                  title="No matching accounts"
                  description="Try another name, email address or role filter."
                />
              )
            }
          >
            <div className="accounts-list">
              <div className="accounts-list__header">
                <span>Member</span>
                <span>Role</span>
                <span>Account details</span>
                <span className="accounts-list__actions-heading">Actions</span>
              </div>

              {visible.map((user) => (
                <article className="accounts-row" key={user.id}>
                  <div className="accounts-member">
                    <span className="accounts-avatar" aria-hidden="true">
                      {initials(user.name)}
                    </span>

                    <div className="accounts-member__copy">
                      <p className="accounts-member__name">
                        {user.name || 'Unnamed user'}
                      </p>
                      <p className="accounts-member__email">{user.email}</p>
                    </div>
                  </div>

                  <div className="accounts-role">
                    <Badge>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                  </div>

                  <div className="accounts-details">
                    <p className="accounts-details__joined">
                      <span>Joined</span>
                      {formatDate(user.created_at)}
                    </p>

                    {user.role === ROLES.STUDENT && (
                      <p className="accounts-details__secondary">
                        {user.memberships ?? 0} memberships
                        <span>·</span>
                        {user.registrations ?? 0} registrations
                      </p>
                    )}

                    {user.role === ROLES.CLUB_ADMIN && (
                      <p className="accounts-details__secondary">
                        Administers {user.clubs_administered ?? 0}{' '}
                        {(user.clubs_administered ?? 0) === 1 ? 'club' : 'clubs'}
                      </p>
                    )}
                  </div>

                  <div className="accounts-row__actions">
                    <Button
                      variant={resetUserId === user.id ? 'secondary' : 'ghost'}
                      size="sm"
                      icon={resetUserId === user.id ? 'x' : 'key-round'}
                      onClick={() =>
                        resetUserId === user.id
                          ? closeResetForm()
                          : openResetForm(user.id)
                      }
                      aria-expanded={resetUserId === user.id}
                    >
                      {resetUserId === user.id ? 'Close' : 'Reset password'}
                    </Button>
                  </div>

                  {resetUserId === user.id && (
                    <form
                      className="accounts-reset"
                      onSubmit={handleResetPassword}
                    >
                      <div className="accounts-reset__heading">
                        <div>
                          <h3>Reset password</h3>
                          <p>
                            Set a new password for {user.name || 'this account'}.
                          </p>
                        </div>
                        <span className="accounts-reset__icon" aria-hidden="true">
                          ↻
                        </span>
                      </div>

                      <div className="accounts-reset__fields">
                        <label className="accounts-field">
                          <span>New password</span>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(event) =>
                              setNewPassword(event.target.value)
                            }
                            placeholder="Enter new password"
                            minLength={8}
                            autoComplete="new-password"
                            required
                          />
                        </label>

                        <label className="accounts-field">
                          <span>Confirm new password</span>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) =>
                              setConfirmPassword(event.target.value)
                            }
                            placeholder="Re-enter new password"
                            minLength={8}
                            autoComplete="new-password"
                            required
                          />
                        </label>
                      </div>

                      <div className="accounts-reset__footer">
                        <p>Use at least 8 characters.</p>
                        <div className="accounts-reset__buttons">
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={closeResetForm}
                            disabled={resetSaving}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            icon="check"
                            loading={resetSaving}
                          >
                            {resetSaving ? 'Saving...' : 'Save password'}
                          </Button>
                        </div>
                      </div>
                    </form>
                  )}
                </article>
              ))}
            </div>
          </AsyncSection>
        </Panel>
      </section>
    </div>
  );
}
