import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Panel } from '../../components/ui/Panel.jsx';
import {
  AsyncSection,
  EmptyState,
  ListSkeleton,
} from '../../components/ui/States.jsx';
import { Tabs } from '../../components/ui/Toolbar.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/index.js';
import { notificationService } from '../../services/index.js';
import { formatRelativeTime } from '../../utils/format.js';
import { humanize } from '../../utils/status.js';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refresh: refreshBadge } = useNotifications();

  const [tab, setTab] = useState('all');
  const [marking, setMarking] = useState(false);

  const notifications = useAsync(
    () => notificationService.listNotifications(),
    [],
  );

  const rows = useMemo(() => notifications.data ?? [], [notifications.data]);
  const unreadCount = useMemo(
    () => rows.filter((row) => !row.read).length,
    [rows],
  );

  const visible = tab === 'unread' ? rows.filter((row) => !row.read) : rows;

  /** Opening a notification marks it read, then follows its link if it has one. */
  const open = async (item) => {
    if (!item.read) {
      try {
        await notificationService.markRead(item.id);
        notifications.setData((current) =>
          (current ?? []).map((row) =>
            row.id === item.id ? { ...row, read: true } : row,
          ),
        );
        refreshBadge();
      } catch {
        // Reading is a convenience; a failure here should not block navigation.
      }
    }
    if (item.link) navigate(item.link);
  };

  const markAll = async () => {
    setMarking(true);
    try {
      await notificationService.markAllRead();
      notifications.setData((current) =>
        (current ?? []).map((row) => ({ ...row, read: true })),
      );
      refreshBadge();
      toast.success('All notifications marked as read.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setMarking(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Updates about your clubs, events and approvals."
        actions={
          unreadCount > 0 ? (
            <Button icon="check" loading={marking} onClick={markAll}>
              Mark all as read
            </Button>
          ) : null
        }
      />

      {rows.length > 0 ? (
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <Tabs
            label="Filter notifications"
            value={tab}
            onChange={setTab}
            items={[
              { ...TABS[0], count: rows.length },
              { ...TABS[1], count: unreadCount },
            ]}
          />
        </div>
      ) : null}

      <Panel flush>
        <AsyncSection
          loading={notifications.loading}
          error={notifications.error}
          onRetry={notifications.refetch}
          skeleton={<ListSkeleton rows={4} />}
          isEmpty={visible.length === 0}
          empty={
            tab === 'unread' ? (
              <EmptyState
                icon="check-circle"
                title="Nothing unread"
                description="You have read everything. Switch to All to see earlier notifications."
              />
            ) : (
              <EmptyState
                icon="bell"
                title="No notifications yet"
                description="You will be notified when a membership request is reviewed or an event you follow is published."
              />
            )
          }
        >
          <ul>
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={[
                    'notice',
                    item.read ? '' : 'notice--unread',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => open(item)}
                >
                  <span className="notice__gutter" aria-hidden="true">
                    {item.read ? null : <span className="notice__dot" />}
                  </span>

                  <span className="notice__body">
                    <span className="notice__title">{item.title}</span>
                    {item.body ? (
                      <span className="notice__text" style={{ display: 'block' }}>
                        {item.body}
                      </span>
                    ) : null}
                    <span className="notice__time" style={{ display: 'block' }}>
                      {humanize(item.type)} ·{' '}
                      {formatRelativeTime(item.created_at)}
                      {item.read ? '' : ' · Unread'}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </AsyncSection>
      </Panel>
    </>
  );
}
