import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDataSource } from '../../context/DataSourceContext.jsx';
import { useForm } from '../../hooks/index.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../../services/mocks/seed.js';
import { ROLE_HOME, ROLE_LABELS } from '../../utils/constants.js';
import { email as emailRule, required } from '../../utils/validation.js';

export function LoginPage() {
  const { signIn } = useAuth();
  const { isDemo, useDemoData } = useDataSource();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    initialValues: { email: '', password: '' },
    schema: {
      email: emailRule,
      password: required('Password'),
    },
    onSubmit: async (values) => {
      const profile = await signIn({
        email: values.email.trim(),
        password: values.password,
      });
      const destination =
        location.state?.from?.pathname ?? ROLE_HOME[profile.role] ?? '/app';
      navigate(destination, { replace: true });
    },
  });

  const error = form.submitError;

  /** One click to fill a demo account rather than retyping it. */
  const useAccount = (account) => {
    form.setValues({ email: account.email, password: DEMO_PASSWORD });
    form.setSubmitError(null);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account."
      caption="A more connected campus."
      footer={
        <>
          Do not have an account?{' '}
          <Link to="/register" className="btn btn--link">
            Create one
          </Link>
        </>
      }
    >
      <form className="stack" onSubmit={form.handleSubmit} noValidate>
        {error ? (
          <Alert
            tone="danger"
            title={
              error.isNetwork ? 'Cannot reach the server' : 'Sign-in failed'
            }
            action={
              error.isNetwork && !isDemo ? (
                <Button size="sm" onClick={useDemoData}>
                  Use demo data
                </Button>
              ) : null
            }
          >
            {error.message}
          </Alert>
        ) : null}

        <Field label="Email address" error={form.field('email').error} required>
          {(a11y) => (
            <Input
              {...a11y}
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@campus.edu"
              name={form.field('email').name}
              value={form.field('email').value}
              onChange={form.field('email').onChange}
              onBlur={form.field('email').onBlur}
            />
          )}
        </Field>

        <Field
          label="Password"
          error={form.field('password').error}
          required
        >
          {(a11y) => (
            <div className="input-group">
              <Input
                {...a11y}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                name={form.field('password').name}
                value={form.field('password').value}
                onChange={form.field('password').onChange}
                onBlur={form.field('password').onBlur}
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

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={form.submitting}
        >
          {form.submitting ? 'Signing in' : 'Sign in'}
        </Button>
      </form>

      {isDemo ? <DemoAccounts onSelect={useAccount} /> : null}
    </AuthLayout>
  );
}

/** Demo-mode helper. Never rendered against the live API. */
function DemoAccounts({ onSelect }) {
  return (
    <section style={{ marginTop: 'var(--sp-6)' }}>
      <div
        className="row"
        style={{ marginBottom: 'var(--sp-2)', color: 'var(--c-text-muted)' }}
      >
        <Icon name="database" size={14} />
        <span style={{ fontSize: 'var(--fs-12)' }}>
          Demo accounts — password <code>{DEMO_PASSWORD}</code>
        </span>
      </div>

      <div className="panel panel--flush">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            className="demo-account"
            onClick={() => onSelect(account)}
          >
            <span className="demo-account__text">
              <span className="demo-account__role">
                {ROLE_LABELS[account.role]}
              </span>
              <span className="demo-account__email">{account.email}</span>
            </span>
            <Icon name="arrow-right" size={15} className="text-muted" />
          </button>
        ))}
      </div>
    </section>
  );
}
