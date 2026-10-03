
import { useMemo, useState } from 'react';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
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

const ROLE_OPTIONS = [
  { value: 'all', label: 'All roles' },
  ...Object.values(ROLES).map((role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })),
];

export function UserManagementPage() {
  // Search and filter
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  // Create account form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newRole, setNewRole] = useState(ROLES.FACULTY_COORDINATOR);

  // Reset password form
  const [resetUserId, setResetUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading and messages
  const [saving, setSaving] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [formError, setFormError] = useState('');

  const search = useDebouncedValue(query, 200);
  const users = useAsync(() => userService.listUsers(), []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (users.data ?? []).filter((user) => {
      if (role !== 'all' && user.role !== role) return false;
      if (!term) return true;

      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [users.data, search, role]);

  const total = users.data?.length ?? 0;

  // Create account
  async function handleCreateUser(event) {
    event.preventDefault();

    setSaving(true);
    setNotice('');
    setFormError('');

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

  // Reset password
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
      const result = await userService.resetUserPassword(
        resetUserId,
        {
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

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
    <>
      <PageHeader
        title="Accounts"
        description="Manage CampusOS accounts, create users and reset passwords."
      />

      {/* CREATE ACCOUNT */}
      <Panel>
        <div style={{ padding: 'var(--sp-3)' }}>
          <h2 style={{ marginTop: 0 }}>Create a new account</h2>

          <p className="record__meta">
            Create accounts for students, club administrators,
            faculty coordinators and system administrators.
          </p>

          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gap: 'var(--sp-3)' }}>
              <label>
                Full name
                <input
                  style={fieldStyle}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter full name"
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Email address
                <input
                  style={fieldStyle}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter email address"
                  maxLength={150}
                  required
                />
              </label>

              <label>
                Temporary password
                <input
                  style={fieldStyle}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>

              <label>
                Account role
                <select
                  style={fieldStyle}
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
              </label>

              <button type="submit" disabled={saving}>
                {saving ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </Panel>

      {/* SUCCESS AND ERROR MESSAGES */}
      {notice && (
        <p role="status" style={{ color: 'green' }}>
          {notice}
        </p>
      )}

      {formError && (
        <p role="alert" style={{ color: '#c62828' }}>
          {formError}
        </p>
      )}

      {/* ACCOUNT LIST */}
      <PageHeader
        title="All accounts"
        description="Search accounts, filter by role and manage passwords."
      />

      <div
        className="row-wrap"
        style={{
          marginBottom: 'var(--sp-4)',
          gap: 'var(--sp-3)',
        }}
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search accounts"
          placeholder="Search by name or email"
          className="spacer"
        />

        <FilterSelect
          label="Filter by role"
          value={role}
          onChange={setRole}
          options={ROLE_OPTIONS}
        />
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
                title="No accounts"
                description="Create an account using the form above."
              />
            ) : (
              <EmptyState
                icon="search"
                title="No matching accounts"
                description="Try a different name, email or role filter."
              />
            )
          }
        >
          <div className="record-list">
            {visible.map((user) => (
              <div className="record" key={user.id}>
                <span className="club-monogram" aria-hidden="true">
                  {initials(user.name)}
                </span>

                <div className="record__body">
                  <p className="record__title">
                    {user.name}
                  </p>

                  <p className="record__meta">
                    <span>{user.email}</span>

                    <span className="record__meta-sep">
                      Joined {formatDate(user.created_at)}
                    </span>
                  </p>

                  {user.role === ROLES.STUDENT && (
                    <p className="record__meta">
                      {user.memberships} club memberships ·{' '}
                      {user.registrations} registrations
                    </p>
                  )}

                  {user.role === ROLES.CLUB_ADMIN && (
                    <p className="record__meta">
                      Administers {user.clubs_administered}{' '}
                      {user.clubs_administered === 1
                        ? 'club'
                        : 'clubs'}
                    </p>
                  )}

                  {/* RESET PASSWORD FORM */}
                  {resetUserId === user.id && (
                    <form
                      onSubmit={handleResetPassword}
                      style={{
                        display: 'grid',
                        gap: '10px',
                        marginTop: '14px',
                        maxWidth: '360px',
                      }}
                    >
                      <strong>
                        Reset password for {user.name}
                      </strong>

                      <input
                        style={fieldStyle}
                        type="password"
                        placeholder="New password"
                        value={newPassword}
                        onChange={(event) =>
                          setNewPassword(event.target.value)
                        }
                        minLength={8}
                        required
                      />

                      <input
                        style={fieldStyle}
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        minLength={8}
                        required
                      />

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="submit"
                          disabled={resetSaving}
                        >
                          {resetSaving
                            ? 'Saving...'
                            : 'Save new password'}
                        </button>

                        <button
                          type="button"
                          onClick={closeResetForm}
                          disabled={resetSaving}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* ROLE AND RESET BUTTON */}
                <div
                  className="record__aside"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'flex-end',
                  }}
                >
                  <Badge>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </Badge>

                  <button
                    type="button"
                    onClick={() =>
                      resetUserId === user.id
                        ? closeResetForm()
                        : openResetForm(user.id)
                    }
                  >
                    {resetUserId === user.id
                      ? 'Close'
                      : 'Reset Password'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AsyncSection>
      </Panel>
    </>
  );
}

const fieldStyle = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '6px',
  padding: '10px 12px',
  border: '1px solid var(--border, #ccc)',
  borderRadius: '8px',
  font: 'inherit',
};