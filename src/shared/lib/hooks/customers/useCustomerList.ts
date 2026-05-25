import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/shared/lib/api/customer.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useCustomerList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.tenant_id;

  return useQuery({
    queryKey: ['customers', tenantId],
    queryFn: customerApi.getCustomers,
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
