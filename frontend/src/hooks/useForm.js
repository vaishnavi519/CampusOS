import { useCallback, useRef, useState } from 'react';
import { validate } from '../utils/validation.js';

/**
 * Form state with blur-then-change validation: a field is not marked invalid
 * until the user has left it once, after which it revalidates as they type.
 *
 * @param {object} initialValues
 * @param {object} schema  `{ field: rule | rule[] }` — see utils/validation.
 * @param {Function} onSubmit  Async; may throw to surface a submit-level error.
 */
export function useForm({ initialValues, schema = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  const setValue = useCallback((name, value) => {
    setValues((previous) => {
      const next = { ...previous, [name]: value };
      setErrors((currentErrors) => {
        if (!currentErrors[name]) return currentErrors;
        const rules = schemaRef.current[name];
        if (!rules) return currentErrors;
        const message = validate(next, { [name]: rules })[name];
        const updated = { ...currentErrors };
        if (message) updated[name] = message;
        else delete updated[name];
        return updated;
      });
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (event) => {
      const { name, value, type, checked } = event.target;
      setValue(name, type === 'checkbox' ? checked : value);
    },
    [setValue],
  );

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    setValues((current) => {
      const rules = schemaRef.current[name];
      if (rules) {
        const message = validate(current, { [name]: rules })[name];
        setErrors((previous) => {
          const updated = { ...previous };
          if (message) updated[name] = message;
          else delete updated[name];
          return updated;
        });
      }
      return current;
    });
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event?.preventDefault?.();
      setSubmitError(null);

      const found = validate(values, schemaRef.current);
      setErrors(found);
      setTouched(
        Object.keys(schemaRef.current).reduce(
          (all, key) => ({ ...all, [key]: true }),
          {},
        ),
      );

      if (Object.keys(found).length > 0) {
        // Move focus to the first problem so keyboard users are not stranded.
        const first = Object.keys(found)[0];
        document
          .querySelector(`[name="${CSS.escape(first)}"]`)
          ?.focus?.({ preventScroll: false });
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        setSubmitError(error);
      } finally {
        setSubmitting(false);
      }
    },
    [values, onSubmit],
  );

  /** Props for an input bound to `name`, including its error wiring. */
  const field = useCallback(
    (name) => ({
      name,
      value: values[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, handleChange, handleBlur],
  );

  return {
    values,
    errors,
    touched,
    submitting,
    submitError,
    setValue,
    setValues,
    setSubmitError,
    handleChange,
    handleBlur,
    handleSubmit,
    field,
  };
}
