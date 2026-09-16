import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { notificationService } from '../services/index.js';
import { useAuth } from './AuthContext.jsx';

const NotificationContext = createContext(null);

/**
 * Keeps the unread count in one place so the sidebar badge and the
 * notifications page never disagree.
 *
 * The notifications API does not exist yet, so a NotImplementedError is an
 * expected outcome: the count becomes null and the badge simply does not
 * render. Nothing is invented to fill the gap.
 */
export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(null);
      return;
    }
    try {
      setUnreadCount(await notificationService.countUnread());
    } catch {
      setUnreadCount(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh, user?.id]);

  const value = useMemo(
    () => ({ unreadCount, refresh, setUnreadCount }),
    [unreadCount, refresh],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used inside NotificationProvider');
  }
  return context;
}
