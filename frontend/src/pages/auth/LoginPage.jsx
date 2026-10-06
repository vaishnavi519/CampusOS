import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/layout/AuthLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Field, Input } from '../../components/ui/Field.jsx';
import { Icon } from '../../components/ui/Icon.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/index.js';
import { ROLE_HOME } from '../../utils/constants.js';
import { email as emailRule, required } from '../../utils/validation.js';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

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
        location.state?.from?.pathname ??
        ROLE_HOME[profile.role] ??
        '/app';

      navigate(destination, { replace: true });
    },
  });

  const error = form.submitError;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account."
      footer={
        <>
          Do not have an account?{' '}
          <Link to="/register" className="btn btn--link">
            Create one
          </Link>
        </>
      }
    >
      <form
        className="stack"
        onSubmit={form.handleSubmit}
        noValidate
      >
        {error ? (
          <Alert tone="danger" title="Sign-in failed">
            {error.message}
          </Alert>
        ) : null}

        <Field
          label="Email address"
          error={form.field('email').error}
          required
        >
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
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
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
    </AuthLayout>
  );
}