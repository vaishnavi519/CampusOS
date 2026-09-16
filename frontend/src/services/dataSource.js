import { STORAGE_KEYS } from '../utils/constants.js';
import { readText, writeText } from '../utils/storage.js';
import { NotImplementedError } from './errors.js';

/**
 * CampusOS can run against the real Express backend ("live") or against an
 * in-browser sample dataset ("demo"). Demo mode exists so the frontend is
 * usable before the MySQL instance is provisioned — it is always visibly
 * announced in the UI and never silently substitutes for a real API.
 */

export const DATA_SOURCE = { LIVE: 'live', DEMO: 'demo' };

const DEFAULT_MODE =
  import.meta.env.VITE_API_MODE === DATA_SOURCE.LIVE
    ? DATA_SOURCE.LIVE
    : DATA_SOURCE.DEMO;

let current =
  readText(STORAGE_KEYS.apiMode) === DATA_SOURCE.LIVE
    ? DATA_SOURCE.LIVE
    : readText(STORAGE_KEYS.apiMode) === DATA_SOURCE.DEMO
      ? DATA_SOURCE.DEMO
      : DEFAULT_MODE;

const listeners = new Set();

export function getDataSource() {
  return current;
}

export function isDemoMode() {
  return current === DATA_SOURCE.DEMO;
}

export function setDataSource(mode) {
  const next = mode === DATA_SOURCE.LIVE ? DATA_SOURCE.LIVE : DATA_SOURCE.DEMO;
  if (next === current) return;
  current = next;
  writeText(STORAGE_KEYS.apiMode, next);
  listeners.forEach((listener) => listener(next));
}

export function subscribeToDataSource(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Builds a service whose methods resolve against the live or demo
 * implementation at call time.
 *
 * A method present in `demo` but absent from `live` is a feature the backend
 * has not shipped. Calling it in live mode raises NotImplementedError, which
 * screens render as an explicit "waiting on backend" notice.
 */
export function createService({ live = {}, demo = {}, pending = {} }) {
  const names = new Set([...Object.keys(live), ...Object.keys(demo)]);
  const service = {};

  for (const name of names) {
    service[name] = (...args) => {
      const impl = isDemoMode() ? demo[name] : live[name];
      if (!impl) {
        return Promise.reject(
          new NotImplementedError(
            pending[name]?.feature ?? name,
            pending[name]?.note,
          ),
        );
      }
      return impl(...args);
    };
  }

  return service;
}
