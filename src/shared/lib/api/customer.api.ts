import { getActiveProvider } from './provider-factory';

export const customerApi = {
  getCustomers: () => getActiveProvider().customers.getCustomers(),
  createCustomer: (payload: any) => getActiveProvider().customers.createCustomer(payload),
  updateCustomer: (id: string, payload: any) => getActiveProvider().customers.updateCustomer(id, payload),
  deleteCustomer: (id: string) => getActiveProvider().customers.deleteCustomer(id),
};
