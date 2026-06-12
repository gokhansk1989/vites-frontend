'use client';
import { useParams, useRouter } from 'next/navigation';
import { useOrder, useConfirmCashPayment, useConfirmHandoff, useConfirmReceipt, useCancelOrder } from '@/hooks/useOrders';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const STEPS: Record<string, { label: string; done: string[] }> = {
  CREATED:          { label: 'Ödemeyi onayla', done: [] },
  PAID_ESCROW:      { label: 'Satıcı teslim etmeyi bekliyor', done: ['CREATED'] },
  DELIVERED:        { label: 'Teslim alındı mı?', done: ['CREATED','PAID_ESCROW'] },
  COMPLETED:        { label: 'Tamamlandı', done: ['CREATED','PAID_ESCROW','DELIVERED','COMPLETED'] },
  CANCELLED:        { label: 'İptal edildi', done: [] },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: order, isLoading } = useOrder(id);
  const confirmCash = useConfirmCashPayment();
  const confirmHandoff = useConfirmHandoff();
  const confirmReceipt = useConfirmReceipt();
  const cancelOrder = useCancelOrder();
  const [note, setNote] = useState('');

  if (isLoading) return <div className="max-w-xl mx-auto px-4 py-8 animate-pulse"><div className="h-64 bg-gray-200 rounded-2xl"/></div>;
  if (!order) return <div className="text-center py-24 text-gray-400">Sipariş bulunamadı</div>;

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  const handleAction = async (action: string) => {
    try {
      if (action === 'cash') await confirmCash.mutateAsync({ id, meetingNote: note });
      if (action === 'handoff') await confirmHandoff.mutateAsync({ id, meetingNote: note });
      if (action === 'receipt') await confirmReceipt.mutateAsync(id);
      if (action === 'cancel') await cancelOrder.mutateAsync(id);
      toast.success('İşlem başarılı!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const stepKeys = ['CREATED', 'PAID_ESCROW', 'DELIVERED', 'COMPLETED'];
  const currentIdx = stepKeys.indexOf(order.status);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/siparislerim" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft className="w-4 h-4" /> Siparişlerim
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Sipariş #{order.id.slice(-8)}</p>
            <h2 className="font-bold text-lg">{order.listing?.title}</h2>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="flex items-center gap-3 py-3 border-y border-gray-50 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden">
            {order.listing?.images?.[0] && <img src={order.listing.images[0].url} className="w-full h-full object-cover" alt=""/>}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{isBuyer ? 'Satıcı' : 'Alıcı'}: <span className="font-medium">{isBuyer ? order.seller?.displayName : order.buyer?.displayName}</span></p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">{formatPrice(order.amount)}</p>
          </div>
        </div>

        {/* Adım göstergesi */}
        {!['CANCELLED','REFUNDED','DISPUTED'].includes(order.status) && (
          <div className="flex items-center gap-0 mb-6">
            {stepKeys.map((step, i) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < currentIdx ? 'bg-emerald-500 text-white' : i === currentIdx ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < currentIdx ? <CheckCircle className="w-4 h-4"/> : i+1}
                </div>
                {i < stepKeys.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIdx ? 'bg-emerald-400' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>
        )}

        {order.shipment?.meetingNote && (
          <div className="bg-orange-50 rounded-xl p-3 mb-4 text-sm text-orange-800">
            📍 {order.shipment.meetingNote}
          </div>
        )}

        {/* Aksiyon alanı */}
        <div className="space-y-3">
          {order.status === 'CREATED' && isBuyer && order.paymentMethod === 'CASH' && (
            <>
              <Input label="Buluşma notu (opsiyonel)" value={note} onChange={e => setNote(e.target.value)} placeholder="İstanbul / Pazar 15:00…" />
              <Button className="w-full" loading={confirmCash.isPending} onClick={() => handleAction('cash')}>
                Elden Ödeyeceğimi Onayla
              </Button>
            </>
          )}
          {order.status === 'PAID_ESCROW' && isSeller && order.paymentMethod === 'CASH' && (
            <>
              <Input label="Teslim notu (opsiyonel)" value={note} onChange={e => setNote(e.target.value)} />
              <Button className="w-full" loading={confirmHandoff.isPending} onClick={() => handleAction('handoff')}>
                Teslim Ettim
              </Button>
            </>
          )}
          {order.status === 'DELIVERED' && isBuyer && (
            <Button className="w-full" loading={confirmReceipt.isPending} onClick={() => handleAction('receipt')}>
              Teslim Aldım — Siparişi Tamamla
            </Button>
          )}
          {['CREATED','PAID_ESCROW'].includes(order.status) && (isBuyer || isSeller) && (
            <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50" loading={cancelOrder.isPending} onClick={() => handleAction('cancel')}>
              İptal Et
            </Button>
          )}
          {order.status === 'COMPLETED' && (
            <Link href={`/ilan/${order.listingId}`}>
              <Button variant="outline" className="w-full">Yorumu Bırak</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
