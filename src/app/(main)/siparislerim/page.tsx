'use client';
import { useState } from 'react';
import { useMyOrders } from '@/hooks/useOrders';
import { StatusBadge } from '@/components/ui/Badge';
import { formatPrice, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const { data: orders, isLoading } = useMyOrders(role);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

      <div className="flex gap-2 mb-6">
        {(['buyer', 'seller'] as const).map((r) => (
          <button key={r} onClick={() => setRole(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${role === r ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
            {r === 'buyer' ? 'Aldıklarım' : 'Sattıklarım'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({length: 3}).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl border animate-pulse"/>)}</div>
      ) : orders?.length ? (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Link key={o.id} href={`/siparislerim/${o.id}`}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
              <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                {o.listing?.images?.[0]
                  ? <img src={o.listing.images[0].url} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{o.listing?.title}</p>
                <p className="text-orange-600 font-bold">{formatPrice(o.amount)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(o.createdAt)}</p>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Henüz sipariş yok</p>
        </div>
      )}
    </div>
  );
}
