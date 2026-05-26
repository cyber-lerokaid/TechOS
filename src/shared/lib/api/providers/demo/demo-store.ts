import { MOCK_CUSTOMERS, MOCK_SERVICE_ORDERS, MOCK_PRODUCTS } from '@/data/mock-data';

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class DemoStore {
  public customers: any[];
  public orders: any[];
  public inventory: any[];

  constructor() {
    const savedCustomers = localStorage.getItem('demo_customers');
    const savedOrders = localStorage.getItem('demo_orders');
    const savedInventory = localStorage.getItem('demo_inventory');

    this.customers = savedCustomers ? JSON.parse(savedCustomers) : [...MOCK_CUSTOMERS];
    this.orders = savedOrders ? JSON.parse(savedOrders) : [...MOCK_SERVICE_ORDERS];
    this.inventory = savedInventory ? JSON.parse(savedInventory) : [...MOCK_PRODUCTS];
  }

  saveOrders() {
    localStorage.setItem('demo_orders', JSON.stringify(this.orders));
  }
  
  saveCustomers() {
    localStorage.setItem('demo_customers', JSON.stringify(this.customers));
  }

  saveInventory() {
    localStorage.setItem('demo_inventory', JSON.stringify(this.inventory));
  }
}

export const demoStore = new DemoStore();