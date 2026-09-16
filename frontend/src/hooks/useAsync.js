import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async loader and exposes idle/loading/success/error as one state.
 *
 * Results from a superseded call are discarded, so fast filter changes cannot
 * land out of order, and nothing is written after unmount.
 *
 * @param {Function} loader  Called with no arguments; must return a promise.
 * @param {Array} deps       Re-runs the loader when these change.
 * @param {object} [options]
 * @param {boolean} [options.enabled]  Skip loading entirely when false.
 */
export function useAsync(loader, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({
    status: enabled ? 'loading' : 'idle',
    data: null,
    error: null,
  });

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const generation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    const id = ++generation.current;
    setState((previous) => ({ ...previous, status: 'loading', error: null }));

    try {
      const data = await loaderRef.current();
      if (!mounted.current || id !== generation.current) return;
      setState({ status: 'success', data, error: null });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      if (!mounted.current || id !== generation.current) return;
      setState({ status: 'error', data: null, error });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle', data: null, error: null });
      return;
    }
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  /** Optimistic local update — e.g. after an action mutates one row. */
  const setData = useCallback((updater) => {
    setState((previous) => ({
      ...previous,
      data: typeof updater === 'function' ? updater(previous.data) : updater,
    }));
  }, []);

  return {
    ...state,
    loading: state.status === 'loading',
    refetch: run,
    setData,
  };
}
