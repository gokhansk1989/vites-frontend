import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMyOrders(role: 'buyer' | 'seller' = 'buyer') {
  return useQuery({
    queryKey: ['orders', role],
    queryFn: () => api.get('/orders/mine', { params: { role } }).then((r) => r.data),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { listingId: string; paymentMethod: 'ONLINE' | 'CASH'; amount?: string }) =>
      api.post('/orders', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useConfirmCashPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, meetingNote }: { id: string; meetingNote?: string }) =>
      api.post(`/orders/${id}/cash-payment`, { meetingNote }).then((r) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['order', id] }),
  });
}

export function useConfirmHandoff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, meetingNote }: { id: string; meetingNote?: string }) =>
      api.post(`/orders/${id}/handoff`, { meetingNote }).then((r) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ['order', id] }),
  });
}

export function useConfirmReceipt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/receipt`).then((r) => r.data),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: ['order', id] }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/orders/${id}/cancel`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
