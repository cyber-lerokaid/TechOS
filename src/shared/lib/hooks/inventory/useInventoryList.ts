import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/shared/lib/api/inventory.api';
import { useAuth } from '@/app/providers/AuthContext';

export const useInventoryList = () => {
  const { user } = useAuth();
  const tenantId = user?.user_metadata?.tenant_id || user?.tenant_id;

  return useQuery({
    queryKey: ['inventory', tenantId],
    queryFn: inventoryApi.getInventory,
    enabled: !!tenantId,
  });
};
