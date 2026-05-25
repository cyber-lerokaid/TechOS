import { getActiveProvider } from './provider-factory';

export const inventoryApi = {
  getInventory: () => getActiveProvider().inventory.getInventory(),
  createInventoryItem: (payload: any) => getActiveProvider().inventory.createInventoryItem(payload),
  updateInventoryItem: (id: string, payload: any) => getActiveProvider().inventory.updateInventoryItem(id, payload),
};
