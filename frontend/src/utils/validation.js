/**
 * Small validation helpers. Rules mirror what the backend enforces so users do
 * not get a surprise 400 after a clean-looking form.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const required = (label) => (value) =>
  value === null || value === undefined || String(value).trim() === ''
    ? `${label} is required.`
    : null;

export const email = (value) => {
  if (!String(value ?? '').trim()) return 'Email address is required.';
  return EMAIL_RE.test(String(value).trim())
    ? null
    : 'Enter a valid email address.';
};

export const minLength = (length, label) => (value) =>
  String(value ?? '').length < length
    ? `${label} must be at least ${length} characters.`
    : null;

export const matches = (other, message) => (value, values) =>
  value !== values[other] ? message : null;

export const positiveInteger = (label) => (value) => {
  const text = String(value ?? '').trim();
  if (!text) return `${label} is required.`;
  const number = Number(text);
  if (!Number.isInteger(number) || number < 1) {
    return `${label} must be a whole number of 1 or more.`;
  }
  return null;
};

export const notInPast = (label) => (value) => {
  if (!value) return `${label} is required.`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = String(value).split('-').map(Number);
  if (!y || !m || !d) return `Enter a valid ${label.toLowerCase()}.`;
  return new Date(y, m - 1, d) < today
    ? `${label} cannot be in the past.`
    : null;
};

/**
 * Runs a `{ field: [rule, ...] }` schema over a values object.
 * Returns `{ field: 'first failing message' }`.
 */
export function validate(values, schema) {
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    for (const rule of [].concat(rules)) {
      const message = rule(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  }
  return errors;
}
