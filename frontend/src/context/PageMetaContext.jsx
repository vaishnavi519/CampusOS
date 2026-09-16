import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PageMetaContext = createContext(null);

/**
 * Lets the top bar show where the user is without duplicating a breadcrumb
 * definition in every route: the page header publishes its title and parent,
 * the top bar reads them.
 */
export function PageMetaProvider({ children }) {
  const [meta, setMeta] = useState({ title: null, parent: null });
  const value = useMemo(() => ({ ...meta, setMeta }), [meta]);

  return (
    <PageMetaContext.Provider value={value}>
      {children}
    </PageMetaContext.Provider>
  );
}

export function usePageMetaValue() {
  return useContext(PageMetaContext) ?? { title: null, parent: null };
}

/** Called by PageHeader. `parent` is `{ label, to }` on detail screens. */
export function usePublishPageMeta(title, parent) {
  const context = useContext(PageMetaContext);
  const setMeta = context?.setMeta;
  const parentLabel = parent?.label ?? null;
  const parentTo = parent?.to ?? null;

  useEffect(() => {
    if (!setMeta) return undefined;
    setMeta({
      title,
      parent: parentLabel ? { label: parentLabel, to: parentTo } : null,
    });
    document.title = title ? `${title} · CampusOS` : 'CampusOS';
    return undefined;
  }, [setMeta, title, parentLabel, parentTo]);
}
