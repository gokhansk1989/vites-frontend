'use client';
import { useMyOffers, useWithdrawOffer } from '@/hooks/useOffers';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice, timeAgo } from '@/lib/utils';
import { Tag } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OffersPage() {
  const { data: offers, isLoading } = useMyOffers();
  const withdraw = useWithdrawOffer();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tekliflerim</h1>
      {isLoading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 bg-white rounded-2xl border animate-pulse"/>)}</div>
      ) : offers?.length ? (
        <div className="space-y-3">
          {offers.map((o: any) => (
            <div key={o.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                {o.listing?.images?.[0]
                  ? <img src={o.listing.images[0].url} className="w-full h-full object-cover" alt=""/>
                  : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/ilan/${o.listing?.id}`} className="font-medium text-sm hover:text-orange-500 line-clamp-1">{o.listing?.title}</Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-orange-600 font-bold text-sm">{formatPrice(o.amount)}</span>
                  <span className="text-xs text-gray-400 line-through">{formatPrice(o.listing?.price)}</span>
                </div>
                <p className="text-xs text-gray-400">{timeAgo(o.createdAt)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={o.status} />
                {o.status === 'PENDING' && (
                  <Button size="sm" variant="ghost" className="text-red-400 text-xs"
                    loading={withdraw.isPending}
                    onClick={() => withdraw.mutate(o.id, { onSuccess: () => toast.success('Teklif geri çekildi') })}>
                    Geri Çek
                  </Button>
                )}
                {o.status === 'ACCEPTED' && (
                  <Link href={`/siparislerim`}>
                    <Button size="sm">Siparişi Gör</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-gray-400">
          <Tag className="w-12 h-12 mx-auto mb-3 opacity-40"/>
          <p>Henüz teklif vermediniz</p>
        </div>
      )}
    </div>
  );
}
