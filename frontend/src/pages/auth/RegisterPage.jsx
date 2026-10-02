import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/index.js';
import { ROLES, ROLE_HOME } from '../../utils/constants.js';
import {
  email as emailRule,
  matches,
  minLength,
  required,
} from '../../utils/validation.js';

/**
 * Self-service registration.
 *
 * The backend accepts any of the four roles here, but faculty and registrar
 * accounts are institutional, so only the two self-service roles are offered.
 */
const SELECTABLE_ROLES = [
  {
    value: ROLES.STUDENT,
    title: 'Student',
    description: 'Join clubs and register for events.',
  },
];

export function RegisterPage() {
  const { registerAndSignIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ROLES.STUDENT,
    },
    schema: {
      name: required('Full name'),
      email: emailRule,
      password: [required('Password'), minLength(8, 'Password')],
      confirmPassword: [
        required('Password confirmation'),
        matches('password', 'The two passwords do not match.'),
      ],
    },
    onSubmit: async (values) => {
      const profile = await registerAndSignIn({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });
      toast.success(`Welcome to CampusOS, ${profile.name.split(' ')[0]}.`);
      navigate(ROLE_HOME[profile.role] ?? '/app', { replace: true });
    },
  });

  const error = form.submitError;
  const bind = (name) => {
    const { error: fieldError, ...props } = form.field(name);
    return { props, error: fieldError };
  };

  const nameField = bind('name');
  const emailField = bind('email');
  const passwordField = bind('password');
  const confirmField = bind('confirmPassword');

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your campus community."
      caption="Same campus. More possibilities."
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="btn btn--link">
            Sign in
          </Link>
        </>
      }
    >
      <form className="stack" onSubmit={form.handleSubmit} noValidate>
        {error ? (
          <Alert
            tone="danger"
            title={
              error.status === 409
                ? 'That email is already registered'
                : 'Registration failed'
            }
          >
            {error.status === 409 ? (
              <>
                Try <Link to="/login" className="btn btn--link">signing in</Link>{' '}
                instead.
              </>
            ) : (
              error.message
            )}
          </Alert>
        ) : null}

        <Field label="Full name" error={nameField.error} required>
          {(a11y) => (
            <Input
              {...a11y}
              {...nameField.props}
              autoComplete="name"
              autoFocus
              placeholder="Riya Sharma"
            />
          )}
        </Field>

        <Field label="Email address" error={emailField.error} required>
          {(a11y) => (
            <Input
              {...a11y}
              {...emailField.props}
              type="email"
              autoComplete="email"
              placeholder="you@campus.edu"
            />
          )}
        </Field>

        <Field
          label="Password"
          hint="At least 8 characters."
          error={passwordField.error}
          required
        >
          {(a11y) => (
            <div className="input-group">
              <Input
                {...a11y}
                {...passwordField.props}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                style={{ paddingRight: 38 }}
              />
              <button
                type="button"
                className="input-group__action"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name="eye" size={15} />
              </button>
            </div>
          )}
        </Field>

        <Field
          label="Confirm password"
          error={confirmField.error}
          required
        >
          {(a11y) => (
            <Input
              {...a11y}
              {...confirmField.props}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
            />
          )}
        </Field>

        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field__label" style={{ padding: 0, marginBottom: 6 }}>
            I am registering as
          </legend>
          <div className="choice-list">
            {SELECTABLE_ROLES.map((role) => (
              <label className="choice" key={role.value}>
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={form.values.role === role.value}
                  onChange={form.handleChange}
                />
                <span>
                  <span className="choice__title">{role.title}</span>
                  <span
                    className="choice__desc"
                    style={{ display: 'block' }}
                  >
                    {role.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="field__hint" style={{ marginTop: 8 }}>
            Faculty coordinator and registrar accounts are issued by the
            institution, not self-registered.
          </p>
        </fieldset>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={form.submitting}
        >
          {form.submitting ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
