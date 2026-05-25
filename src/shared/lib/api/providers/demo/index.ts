import type { IDataProvider } from '../interfaces';
import { customerDemoApi } from './customer.demo';
import { orderDemoApi } from './order.demo';
import { inventoryDemoApi } from './inventory.demo';

export const DemoProvider: IDataProvider = {
  customers: customerDemoApi,
  orders: orderDemoApi,
  inventory: inventoryDemoApi,
};
