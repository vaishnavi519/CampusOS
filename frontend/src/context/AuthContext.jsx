import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { authService } from '../services/index.js';
import { getToken, onUnauthorized, setToken } from '../services/api/client.js';
import { subscribeToDataSource } from '../services/dataSource.js';
import { STORAGE_KEYS } from '../utils/constants.js';
import { readJSON, remove, writeJSON } from '../utils/storage.js';

const AuthContext = createContext(null);

/**
 * Holds the signed-in user for the whole app.
 *
 * The cached user is painted immediately so a refresh does not flash the
 * sign-in screen, then revalidated against /auth/profile. Any 401 from
 * anywhere in the app — including background requests — ends the session once.
 */
export function AuthProvider({ children }) {
  const cached = useRef(readJSON(STORAGE_KEYS.user));

  const [user, setUser] = useState(cached.current);
  const [status, setStatus] = useState(
    getToken() ? 'checking' : 'anonymous',
  );

  const persist = useCallback((nextUser) => {
    setUser(nextUser);
    if (nextUser) writeJSON(STORAGE_KEYS.user, nextUser);
    else remove(STORAGE_KEYS.user);
  }, []);

  const signOut = useCallback(() => {
    authService.logout?.();
    setToken(null);
    persist(null);
    setStatus('anonymous');
  }, [persist]);

  /* Revalidate a restored session. */
  useEffect(() => {
    if (!getToken()) {
      setStatus('anonymous');
      return;
    }

    let active = true;
    authService
      .getProfile()
      .then((profile) => {
        if (!active) return;
        persist(profile);
        setStatus('authenticated');
      })
      .catch((error) => {
        if (!active) return;
        if (error?.status === 401) {
          signOut();
          return;
        }
        // The server is unreachable but the token may still be good — keep the
        // cached identity rather than forcing a sign-in the user cannot do.
        setStatus(cached.current ? 'authenticated' : 'anonymous');
      });

    return () => {
      active = false;
    };
  }, [persist, signOut]);

  /* A 401 from any request ends the session. */
  useEffect(() => onUnauthorized(() => signOut()), [signOut]);

  /* Switching between live and demo invalidates the current credentials. */
  useEffect(() => subscribeToDataSource(() => signOut()), [signOut]);

  const signIn = useCallback(
    async (credentials) => {
      const { token, user: profile } = await authService.login(credentials);
      setToken(token);
      persist(profile);
      setStatus('authenticated');
      return profile;
    },
    [persist],
  );

  /**
   * The backend's register endpoint does not return a token, so a successful
   * registration is followed by a real sign-in call with the same credentials.
   */
  const registerAndSignIn = useCallback(
    async ({ name, email, password, role }) => {
      await authService.register({ name, email, password, role });
      return signIn({ email, password });
    },
    [signIn],
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      status,
      isAuthenticated: status === 'authenticated' && Boolean(user),
      isChecking: status === 'checking',
      signIn,
      signOut,
      registerAndSignIn,
      updateUser: persist,
    }),
    [user, status, signIn, signOut, registerAndSignIn, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
