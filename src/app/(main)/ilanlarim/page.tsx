'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useMyListings } from '@/hooks/useListings';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING_REVIEW: { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
  SOLD: { label: 'Satıldı', color: 'bg-gray-100 text-gray-600' },
  RESERVED: { label: 'Rezerve', color: 'bg-blue-100 text-blue-700' },
};

export default function MyListingsPage() {
  const [filter, setFilter] = useState<string>('ALL');
  const { data, isLoading } = useMyListings();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/listings/${id}`),
    onSuccess: () => { toast.success('İlan silindi'); qc.invalidateQueries({ queryKey: ['myListings'] }); },
    onError: () => toast.error('İlan silinemedi'),
  });

  const listings = data?.items ?? [];
  const filtered = filter === 'ALL' ? listings : listings.filter((l: any) => l.status === filter);

  const tabs = [
    { key: 'ALL', label: 'Tümü', count: listings.length },
    { key: 'ACTIVE', label: 'Aktif', count: listings.filter((l: any) => l.status === 'ACTIVE').length },
    { key: 'PENDING_REVIEW', label: 'Onay Bekliyor', count: listings.filter((l: any) => l.status === 'PENDING_REVIEW').length },
    { key: 'SOLD', label: 'Satıldı', count: listings.filter((l: any) => l.status === 'SOLD').length },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
        <Link href="/ilan-ver"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4"/> İlan Ver
        </Link>
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${filter === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
            {t.label} {t.count > 0 && <span className="ml-1 text-xs opacity-60">({t.count})</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({length:3}).map((_,i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-2">Henüz ilan yok</p>
          <p className="text-sm mb-4">İlk ilanınızı oluşturun</p>
          <Link href="/ilan-ver" className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium">
            İlan Ver
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l: any) => {
            const status = STATUS_LABELS[l.status] ?? { label: l.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={l.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {l.images?.[0] && <img src={l.images[0].url} className="w-full h-full object-cover" alt=""/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">{l.title}</p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <p className="text-orange-500 font-bold text-sm mt-0.5">{formatPrice(l.price)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.viewCount} görüntülenme · {l.favoriteCount} favori</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link href={`/ilan/${l.id}`}
                    className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                    <Eye className="w-4 h-4 text-gray-500"/>
                  </Link>
                  <button onClick={() => confirm('İlanı silmek istediğinizden emin misiniz?') && deleteMutation.mutate(l.id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400"/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
