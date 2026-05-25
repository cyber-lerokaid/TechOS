import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/shared/lib/api/order.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useOrderList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.tenant_id;

  return useQuery({
    queryKey: ['orders', tenantId],
    queryFn: orderApi.getOrders,
    enabled: !!tenantId,
  });
};
