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
    queryFn: () => api.get('/users/notifications').then(r => r.data),
  });

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => api.post('/users/notifications/read', ids ? { ids } : { all: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.items ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bildirimler {unreadCount > 0 && <span className="ml-2 text-sm font-normal text-orange-500">({unreadCount} yeni)</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={() => markRead.mutate(undefined)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <CheckCheck className="w-4 h-4"/> Tümünü okundu işaretle
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({length:6}).map((_,i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20"/>
          <p className="font-medium">Bildirim yok</p>
          <p className="text-sm mt-1">Sipariş ve teklif bildirimleri burada görünecek</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markRead.mutate([n.id])}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                  n.isRead ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100'
                }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-orange-100'}`}>
                  <Icon className={`w-4 h-4 ${n.isRead ? 'text-gray-400' : 'text-orange-500'}`}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"/>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
