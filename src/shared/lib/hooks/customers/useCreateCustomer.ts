import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/shared/lib/api/customer.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.tenant_id;

  return useMutation({
    mutationFn: (payload: any) => customerApi.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', tenantId] });
    },
  });
};
