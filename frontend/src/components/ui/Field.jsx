import { forwardRef, useId } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Label + control + hint + error, wired together for screen readers.
 *
 * Every control in CampusOS has a real <label>; placeholder text is never the
 * only label. `error` both marks the control invalid and announces politely.
 */
export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
  className,
}) {
  const generated = useId();
  const id = htmlFor ?? generated;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required ? (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {typeof children === 'function'
        ? children({
            id,
            'aria-describedby':
              [hintId, errorId].filter(Boolean).join(' ') || undefined,
            'aria-invalid': error ? 'true' : undefined,
            // aria-required, not the native attribute: validation is ours, and
            // the browser's own bubbles would fight the inline messages.
            'aria-required': required ? 'true' : undefined,
          })
        : children}

      {hint && !error ? (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className="field__error" id={errorId}>
          <Icon name="alert-circle" size={13} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/* -- Controls ------------------------------------------------------------ */

export const Input = forwardRef(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={['input', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={['textarea', className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
});

export const Select = forwardRef(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      className={['select', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </select>
  );
});

/**
 * A labelled field bound to `useForm().field(name)`.
 * Spreads the form props onto the control and shows its error.
 */
export function FormField({
  label,
  hint,
  required,
  as: Control = Input,
  field,
  children,
  ...rest
}) {
  const { error, ...controlProps } = field;

  return (
    <Field label={label} hint={hint} error={error} required={required} {...rest}>
      {(a11y) => (
        <Control {...a11y} {...controlProps}>
          {children}
        </Control>
      )}
    </Field>
  );
}
