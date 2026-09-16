import { useEffect, useRef, useState } from 'react';

export { useAsync } from './useAsync.js';
export { useForm } from './useForm.js';

/** Delays a fast-changing value — used to keep search input responsive. */
export function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/** Calls `handler` on a pointer press or Escape outside the referenced node. */
export function useDismissable(ref, handler, active = true) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return undefined;

    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handlerRef.current(event);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') handlerRef.current(event);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, active]);
}

/** Subscribes to a media query. */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Sets the document title, restoring nothing — every route sets its own. */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · CampusOS` : 'CampusOS';
  }, [title]);
}
