import { useMemo, useState } from 'react';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import {
  FilterSelect,
  SearchInput,
} from '../../components/ui/Toolbar.jsx';
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

const CREATE_ROLE_OPTIONS = [
  {
    value: ROLES.STUDENT,
    label: ROLE_LABELS[ROLES.STUDENT],
  },
  {
    value: ROLES.CLUB_ADMIN,
    label: ROLE_LABELS[ROLES.CLUB_ADMIN],
  },
  {
    value: ROLES.FACULTY_COORDINATOR,
    label: ROLE_LABELS[ROLES.FACULTY_COORDINATOR],
  },
  {
    value: ROLES.SYSTEM_ADMIN,
    label: ROLE_LABELS[ROLES.SYSTEM_ADMIN],
  },
];

export function UserManagementPage() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('all');

  // Create account
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createRole, setCreateRole] = useState(ROLES.STUDENT);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Reset password
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const search = useDebouncedValue(query, 200);

  const users = useAsync(() => userService.listUsers(), []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();

    return (users.data ?? []).filter((user) => {
      if (role !== 'all' && user.role !== role) {
        return false;
      }

      if (!term) {
        return true;
      }

      return (
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      );
    });
  }, [users.data, search, role]);

  const total = users.data?.length ?? 0;

  // ------------------------------------------------------------
  // CREATE ACCOUNT
  // ------------------------------------------------------------

  const handleCreateAccount = async (event) => {
    event.preventDefault();

    setCreateError('');
    setCreateSuccess('');

    if (!name.trim() || !email.trim() || !password) {
      setCreateError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }

    try {
      setCreateLoading(true);

      await userService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: createRole,
      });

      setCreateSuccess('Account created successfully.');

      setName('');
      setEmail('');
      setPassword('');
      setCreateRole(ROLES.STUDENT);

      await users.refetch();
    } catch (error) {
      setCreateError(
        error?.message ||
          'Unable to create the account. Please try again.',
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setCreateError('');
    setCreateSuccess('');

    setName('');
    setEmail('');
    setPassword('');
    setCreateRole(ROLES.STUDENT);
  };

  // ------------------------------------------------------------
  // RESET PASSWORD
  // ------------------------------------------------------------

  const openResetPassword = (user) => {
    setResetUser(user);
    setResetPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const closeResetPassword = () => {
    if (resetLoading) {
      return;
    }

    setResetUser(null);
    setResetPassword('');
    setResetConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setResetError('');
    setResetSuccess('');

    if (!resetUser) {
      return;
    }

    if (!resetPassword || !resetConfirmPassword) {
      setResetError('Please enter and confirm the new password.');
      return;
    }

    if (resetPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      setResetError('The passwords do not match.');
      return;
    }

    try {
      setResetLoading(true);

      await userService.resetUserPassword(
        resetUser.id,
        resetPassword,
      );

      setResetSuccess(
        `Password reset successfully for ${resetUser.name}.`,
      );

      setResetPassword('');
      setResetConfirmPassword('');

      /*
       * Leave the success message visible briefly inside the modal.
       * Refresh the account list so the UI remains synchronized.
       */
      await users.refetch();

      setTimeout(() => {
        setResetUser(null);
        setResetSuccess('');
      }, 1000);
    } catch (error) {
      setResetError(
        error?.message ||
          'Unable to reset the password. Please try again.',
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .accounts-page {
          width: 100%;
          padding-bottom: 32px;
        }

        .accounts-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 8px;
          margin-bottom: 24px;
        }

        .accounts-create-panel {
          margin-bottom: 24px;
          padding: 30px 32px 32px;
          border-radius: 16px;
          overflow: visible;
        }

        .accounts-create-header {
          margin-bottom: 26px;
        }

        .accounts-create-title {
          margin: 0 0 8px;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 650;
          color: var(--color-text, #222);
        }

        .accounts-create-description {
          margin: 0;
          max-width: 850px;
          font-size: 14px;
          line-height: 1.55;
          color: var(--color-text-muted, #777);
        }

        .accounts-alert {
          margin-bottom: 22px;
          padding: 13px 15px;
          border-radius: 10px;
          font-size: 14px;
          line-height: 1.45;
        }

        .accounts-alert--error {
          background: var(--color-danger-soft, #fff0f0);
          color: var(--color-danger, #b42318);
        }

        .accounts-alert--success {
          background: var(--color-success-soft, #ecfdf3);
          color: var(--color-success, #027a48);
        }

        .accounts-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 24px;
          row-gap: 22px;
        }

        .accounts-field {
          min-width: 0;
        }

        .accounts-field .field__label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text, #333);
        }

        .accounts-field .input {
          width: 100%;
          min-height: 48px;
          box-sizing: border-box;
          padding: 11px 14px;
          border: 1px solid #d6d6d6;
          border-radius: 10px;
          background: #fff;
          font-size: 15px;
          color: #222;
          outline: none;
        }

        .accounts-field .input:focus {
          border-color: #777;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
        }

        .accounts-form-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
        }

        .accounts-toolbar {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 220px;
          gap: 16px;
          align-items: end;
          margin-bottom: 20px;
        }

        .accounts-list-panel {
          overflow: hidden;
          border-radius: 16px;
        }

        .accounts-record {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          padding: 20px 22px;
          box-sizing: border-box;
        }

        .accounts-record + .accounts-record {
          border-top: 1px solid #eeeeee;
        }

        .accounts-record__body {
          flex: 1;
          min-width: 0;
        }

        .accounts-record__aside {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .reset-password-button {
          min-height: 38px;
          padding: 0 14px;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          background: #fff;
          color: #333;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition:
            background 0.15s ease,
            border-color 0.15s ease;
        }

        .reset-password-button:hover {
          background: #f7f7f7;
          border-color: #b8b8b8;
        }

        .reset-password-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.07);
        }

        .password-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.42);
          box-sizing: border-box;
        }

        .password-modal {
          width: 100%;
          max-width: 480px;
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          padding: 30px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }

        .password-modal__header {
          margin-bottom: 24px;
        }

        .password-modal__title {
          margin: 0 0 7px;
          font-size: 21px;
          line-height: 1.3;
          font-weight: 650;
          color: #222;
        }

        .password-modal__description {
          margin: 0;
          color: #777;
          font-size: 14px;
          line-height: 1.5;
        }

        .password-modal__user {
          margin: 18px 0 22px;
          padding: 13px 15px;
          border-radius: 10px;
          background: #f7f7f7;
        }

        .password-modal__user-name {
          margin: 0 0 3px;
          font-size: 15px;
          font-weight: 650;
          color: #222;
        }

        .password-modal__user-email {
          margin: 0;
          font-size: 13px;
          color: #777;
          overflow-wrap: anywhere;
        }

        .password-modal__fields {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .password-modal__field label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .password-modal__field input {
          width: 100%;
          min-height: 48px;
          padding: 11px 14px;
          box-sizing: border-box;
          border: 1px solid #d6d6d6;
          border-radius: 10px;
          background: #fff;
          color: #222;
          font-size: 15px;
          outline: none;
        }

        .password-modal__field input:focus {
          border-color: #777;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.06);
        }

        .password-modal__actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 26px;
          padding-top: 4px;
        }

        @media (max-width: 900px) {
          .accounts-record {
            align-items: flex-start;
          }

          .accounts-record__aside {
            flex-direction: column;
            align-items: flex-end;
          }
        }

        @media (max-width: 800px) {
          .accounts-create-panel {
            padding: 24px;
          }

          .accounts-form-grid {
            grid-template-columns: 1fr;
            row-gap: 20px;
          }

          .accounts-toolbar {
            grid-template-columns: 1fr;
          }

          .accounts-record {
            flex-wrap: wrap;
          }

          .accounts-record__body {
            width: calc(100% - 64px);
          }

          .accounts-record__aside {
            width: 100%;
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
          }
        }

        @media (max-width: 600px) {
          .accounts-actions {
            justify-content: stretch;
          }

          .accounts-actions .button {
            width: 100%;
          }

          .accounts-create-panel {
            padding: 22px 18px 24px;
            border-radius: 13px;
          }

          .accounts-form-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .accounts-form-actions .button {
            width: 100%;
          }

          .password-modal-backdrop {
            padding: 14px;
          }

          .password-modal {
            padding: 22px 18px;
            border-radius: 13px;
          }

          .password-modal__actions {
            flex-direction: column-reverse;
          }

          .password-modal__actions .button {
            width: 100%;
          }
        }
      `}</style>

      <div className="accounts-page">
        <PageHeader
          title="Accounts"
          description="Everyone with access to CampusOS, and the role each account holds."
        />

        <div className="accounts-actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setCreateError('');
              setCreateSuccess('');
            }}
          >
            {showCreateForm ? 'Close' : 'Create Account'}
          </button>
        </div>

        {/* -------------------------------------------------- */}
        {/* CREATE ACCOUNT */}
        {/* -------------------------------------------------- */}

        {showCreateForm ? (
          <Panel className="accounts-create-panel">
            <div className="accounts-create-header">
              <h2 className="accounts-create-title">
                Create Account
              </h2>

              <p className="accounts-create-description">
                System Admin can create accounts for students, club
                admins, faculty coordinators and other system
                administrators.
              </p>
            </div>

            {createError ? (
              <div
                className="accounts-alert accounts-alert--error"
                role="alert"
              >
                {createError}
              </div>
            ) : null}

            {createSuccess ? (
              <div
                className="accounts-alert accounts-alert--success"
                role="status"
              >
                {createSuccess}
              </div>
            ) : null}

            <form onSubmit={handleCreateAccount}>
              <div className="accounts-form-grid">
                <div className="accounts-field">
                  <label
                    className="field__label"
                    htmlFor="create-account-name"
                  >
                    Full name
                  </label>

                  <input
                    id="create-account-name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter full name"
                    autoComplete="name"
                    disabled={createLoading}
                  />
                </div>

                <div className="accounts-field">
                  <label
                    className="field__label"
                    htmlFor="create-account-email"
                  >
                    Email
                  </label>

                  <input
                    id="create-account-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter email address"
                    autoComplete="email"
                    disabled={createLoading}
                  />
                </div>

                <div className="accounts-field">
                  <label
                    className="field__label"
                    htmlFor="create-account-password"
                  >
                    Password
                  </label>

                  <input
                    id="create-account-password"
                    type="password"
                    className="input"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={createLoading}
                  />
                </div>

                <div className="accounts-field">
                  <label
                    className="field__label"
                    htmlFor="create-account-role"
                  >
                    Account role
                  </label>

                  <select
                    id="create-account-role"
                    className="input"
                    value={createRole}
                    onChange={(event) =>
                      setCreateRole(event.target.value)
                    }
                    disabled={createLoading}
                  >
                    {CREATE_ROLE_OPTIONS.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="accounts-form-actions">
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={createLoading}
                >
                  {createLoading
                    ? 'Creating...'
                    : 'Create Account'}
                </button>

                <button
                  type="button"
                  className="button button--secondary"
                  onClick={handleCancelCreate}
                  disabled={createLoading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Panel>
        ) : null}

        {/* -------------------------------------------------- */}
        {/* SEARCH / FILTER */}
        {/* -------------------------------------------------- */}

        {total > 0 ? (
          <div className="accounts-toolbar">
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
        ) : null}

        {/* -------------------------------------------------- */}
        {/* ACCOUNT LIST */}
        {/* -------------------------------------------------- */}

        <Panel flush className="accounts-list-panel">
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
                  description="Accounts appear here as people register for CampusOS."
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
                <div
                  className="accounts-record"
                  key={user.id}
                >
                  <span
                    className="club-monogram"
                    aria-hidden="true"
                  >
                    {initials(user.name)}
                  </span>

                  <div className="accounts-record__body">
                    <p className="record__title">
                      {user.name}
                    </p>

                    <p className="record__meta">
                      <span>{user.email}</span>

                      <span className="record__meta-sep">
                        Joined {formatDate(user.created_at)}
                      </span>
                    </p>

                    {user.role === ROLES.STUDENT ? (
                      <p className="record__meta">
                        {Number(user.memberships ?? 0)} club
                        {Number(user.memberships ?? 0) === 1
                          ? ''
                          : 's'}{' '}
                        memberships ·{' '}
                        {Number(user.registrations ?? 0)}{' '}
                        registration
                        {Number(user.registrations ?? 0) === 1
                          ? ''
                          : 's'}
                      </p>
                    ) : user.role === ROLES.CLUB_ADMIN ? (
                      <p className="record__meta">
                        Administers{' '}
                        {Number(
                          user.clubs_administered ?? 0,
                        )}{' '}
                        {Number(
                          user.clubs_administered ?? 0,
                        ) === 1
                          ? 'club'
                          : 'clubs'}
                      </p>
                    ) : null}
                  </div>

                  <div className="accounts-record__aside">
                    <Badge>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </Badge>

                    <button
                      type="button"
                      className="reset-password-button"
                      onClick={() =>
                        openResetPassword(user)
                      }
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </AsyncSection>
        </Panel>
      </div>

      {/* ---------------------------------------------------- */}
      {/* RESET PASSWORD MODAL */}
      {/* ---------------------------------------------------- */}

      {resetUser ? (
        <div
          className="password-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !resetLoading
            ) {
              closeResetPassword();
            }
          }}
        >
          <div
            className="password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
          >
            <div className="password-modal__header">
              <h2
                id="reset-password-title"
                className="password-modal__title"
              >
                Reset Password
              </h2>

              <p className="password-modal__description">
                Set a new password for this account. The new
                password will replace the current password.
              </p>
            </div>

            <div className="password-modal__user">
              <p className="password-modal__user-name">
                {resetUser.name}
              </p>

              <p className="password-modal__user-email">
                {resetUser.email}
              </p>
            </div>

            {resetError ? (
              <div
                className="accounts-alert accounts-alert--error"
                role="alert"
              >
                {resetError}
              </div>
            ) : null}

            {resetSuccess ? (
              <div
                className="accounts-alert accounts-alert--success"
                role="status"
              >
                {resetSuccess}
              </div>
            ) : null}

            <form onSubmit={handleResetPassword}>
              <div className="password-modal__fields">
                <div className="password-modal__field">
                  <label htmlFor="reset-password">
                    New password
                  </label>

                  <input
                    id="reset-password"
                    type="password"
                    value={resetPassword}
                    onChange={(event) =>
                      setResetPassword(event.target.value)
                    }
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    disabled={resetLoading}
                    autoFocus
                  />
                </div>

                <div className="password-modal__field">
                  <label htmlFor="reset-confirm-password">
                    Confirm new password
                  </label>

                  <input
                    id="reset-confirm-password"
                    type="password"
                    value={resetConfirmPassword}
                    onChange={(event) =>
                      setResetConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Enter the password again"
                    autoComplete="new-password"
                    disabled={resetLoading}
                  />
                </div>
              </div>

              <div className="password-modal__actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={closeResetPassword}
                  disabled={resetLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button--primary"
                  disabled={resetLoading}
                >
                  {resetLoading
                    ? 'Resetting...'
                    : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}