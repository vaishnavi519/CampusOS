/**
 * One error shape for the whole app. Components never see a raw fetch failure
 * or an unparsed response body — they get an ApiError with a message that is
 * safe to show a user.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, code = 'error', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** 401 — the session is gone; callers sign the user out. */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** 403 — signed in, but the role is not allowed to do this. */
  get isForbidden() {
    return this.status === 403;
  }

  get isNotFound() {
    return this.status === 404;
  }

  /** Network/offline/CORS — the request never reached the server. */
  get isNetwork() {
    return this.code === 'network';
  }

  /** Retrying is plausible: transient network or server-side failure. */
  get isRetryable() {
    return this.isNetwork || this.status >= 500;
  }
}

/**
 * Raised when a screen needs an endpoint the backend has not built yet.
 * The UI turns this into an explicit "not available" notice rather than a
 * generic failure — and never into fake data.
 */
export class NotImplementedError extends ApiError {
  constructor(feature, note) {
    super(`${feature} is not available yet.`, {
      status: 501,
      code: 'not_implemented',
    });
    this.name = 'NotImplementedError';
    this.feature = feature;
    this.note = note ?? 'This screen is waiting on a backend endpoint.';
  }
}

/** Message shown to the user for any error we did not anticipate. */
export const GENERIC_ERROR_MESSAGE =
  'Something went wrong. Please try again.';

export function errorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return GENERIC_ERROR_MESSAGE;
}
