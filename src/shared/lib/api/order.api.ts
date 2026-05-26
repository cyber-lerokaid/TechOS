import { getActiveProvider } from './provider-factory';

export const orderApi = {
  getOrders: () => getActiveProvider().orders.getOrders(),
  createOrder: (payload: any) => getActiveProvider().orders.createOrder(payload),
  updateOrderStatus: (id: string, status: string) => getActiveProvider().orders.updateOrderStatus(id, status),
  updateOrder: (id: string, payload: any) => getActiveProvider().orders.updateOrder(id, payload),
};
