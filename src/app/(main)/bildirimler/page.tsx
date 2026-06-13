'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Bell, CheckCheck, Package, Tag, MessageCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, any> = {
  ORDER: Package,
  OFFER: Tag,
  DISPUTE: AlertTriangle,
  REVIEW: MessageCircle,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/users/me/notifications').then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => api.post('/users/me/notifications/read', ids ? { ids } : { all: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Okundu işaretlendi');
    },
  });

  const notifications = data?.items ?? [];
  const unreadCount = data?.meta?.unreadCount ?? 0;

  return (
    <div className="m-wrap" style={{ maxWidth: 680, paddingTop: 36, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 className="m-display" style={{ fontSize: 28, color: 'var(--ink)' }}>
          Bildirimler
          {unreadCount > 0 && (
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: 500, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
              {unreadCount} yeni
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markRead.mutate(undefined)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', background: 'none', border: 0, cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}
          >
            <CheckCheck size={15} /> Tümünü okundu işaretle
          </button>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 72, background: 'var(--bg-1)', borderRadius: 12, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Bell size={44} style={{ margin: '0 auto 12px', opacity: 0.2, color: 'var(--ink-3)' }} />
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-2)' }}>Bildirim yok</p>
          <p style={{ fontSize: 13, marginTop: 4, color: 'var(--ink-3)' }}>Sipariş ve teklif bildirimleri burada görünecek</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map((n: any) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate([n.id])}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
                  borderRadius: 12, border: '1px solid var(--line)',
                  background: n.isRead ? 'var(--bg-1)' : 'color-mix(in oklch, var(--accent) 8%, var(--bg-1))',
                  cursor: n.isRead ? 'default' : 'pointer',
                  transition: 'background .15s',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  display: 'grid', placeItems: 'center',
                  background: n.isRead ? 'var(--bg-2)' : 'color-mix(in oklch, var(--accent) 18%, transparent)',
                }}>
                  <Icon size={17} style={{ color: n.isRead ? 'var(--ink-3)' : 'var(--accent)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: n.isRead ? 400 : 600, color: 'var(--ink)', lineHeight: 1.4 }}>{n.title}</p>
                  {n.body && <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.body}</p>}
                  <p style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );
}
