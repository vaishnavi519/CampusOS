import { STORAGE_KEYS } from '../../utils/constants.js';
import { readJSON, remove, writeJSON } from '../../utils/storage.js';
import { buildSeed } from './seed.js';

/**
 * In-browser store behind demo mode.
 *
 * State is persisted to localStorage so a demo survives a refresh, and is
 * re-seeded whenever the seed version changes. Nothing here talks to the
 * network; nothing here is shared between browsers.
 */

let state = load();

function load() {
  const stored = readJSON(STORAGE_KEYS.demoState);
  const seed = buildSeed();
  if (!stored || stored.version !== seed.version) return seed;
  return stored;
}

function persist() {
  writeJSON(STORAGE_KEYS.demoState, state);
}

/** Read-only snapshot. Callers must not mutate what they get back. */
export function snapshot() {
  return state;
}

/** Applies a mutation and persists the result. */
export function commit(mutator) {
  const result = mutator(state);
  persist();
  return result;
}

export function resetStore() {
  state = buildSeed();
  remove(STORAGE_KEYS.demoState);
  persist();
}

export function nextId(collection) {
  const rows = state[collection] ?? [];
  return rows.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1;
}

/** Simulated round-trip so loading states are exercised during development. */
export function latency(ms = 260) {
  const jitter = Math.random() * 140;
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
}

/** Deep-ish clone so callers cannot mutate store rows by reference. */
export const clone = (value) =>
  value === null || value === undefined
    ? value
    : JSON.parse(JSON.stringify(value));
