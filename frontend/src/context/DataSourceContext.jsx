import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import {
  DATA_SOURCE,
  getDataSource,
  setDataSource,
} from '../services/dataSource.js';
import { resetStore } from '../services/mocks/store.js';

const DataSourceContext = createContext(null);

/**
 * Exposes whether the app is reading demo data or the live backend, and lets
 * the user switch. The choice is always visible in the UI — demo data is never
 * presented as if it came from the server.
 */
export function DataSourceProvider({ children }) {
  const [mode, setMode] = useState(getDataSource);

  const change = useCallback((next) => {
    setDataSource(next);
    setMode(getDataSource());
  }, []);

  const resetDemoData = useCallback(() => {
    resetStore();
    window.location.reload();
  }, []);

  const value = useMemo(
    () => ({
      mode,
      isDemo: mode === DATA_SOURCE.DEMO,
      useDemoData: () => change(DATA_SOURCE.DEMO),
      useLiveApi: () => change(DATA_SOURCE.LIVE),
      resetDemoData,
    }),
    [mode, change, resetDemoData],
  );

  return (
    <DataSourceContext.Provider value={value}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (!context) {
    throw new Error('useDataSource must be used inside DataSourceProvider');
  }
  return context;
}
