import type { IDataProvider } from '../interfaces';
import { customerSupabaseApi } from './customer.supabase';
import { orderSupabaseApi } from './order.supabase';
import { inventorySupabaseApi } from './inventory.supabase';

export const SupabaseProvider: IDataProvider = {
  customers: customerSupabaseApi,
  orders: orderSupabaseApi,
  inventory: inventorySupabaseApi,
};
