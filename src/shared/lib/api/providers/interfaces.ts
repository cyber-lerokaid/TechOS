export interface ICustomerApi {
  getCustomers(): Promise<any[]>;
  createCustomer(payload: any): Promise<any>;
  updateCustomer(id: string, payload: any): Promise<any>;
  deleteCustomer(id: string): Promise<void>;
}

export interface IOrderApi {
  getOrders(): Promise<any[]>;
  createOrder(payload: any): Promise<any>;
  updateOrderStatus(id: string, status: string): Promise<any>;
}

export interface IInventoryApi {
  getInventory(): Promise<any[]>;
  createInventoryItem(payload: any): Promise<any>;
  updateInventoryItem(id: string, payload: any): Promise<any>;
}

export interface IDataProvider {
  customers: ICustomerApi;
  orders: IOrderApi;
  inventory: IInventoryApi;
}
