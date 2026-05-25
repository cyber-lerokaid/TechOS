import { MOCK_CUSTOMERS, MOCK_SERVICE_ORDERS, MOCK_PRODUCTS } from '@/data/mock-data';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DemoStore {
  public customers = [...MOCK_CUSTOMERS];
  public orders = [...MOCK_SERVICE_ORDERS];
  public inventory = [...MOCK_PRODUCTS];
}

export const demoStore = new DemoStore();