import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/shared/lib/api/order.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.tenant_id;

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', tenantId] });
    },
  });
};
