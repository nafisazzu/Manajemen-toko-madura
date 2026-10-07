import { RestockLog } from '@/types';
import { IRestockRepository } from './types';
import { getItem, setItem, STORAGE_KEYS } from '../storage/asyncStorage';

export class AsyncRestockRepository implements IRestockRepository {
  async getAll(): Promise<RestockLog[]> {
    return getItem<RestockLog[]>(STORAGE_KEYS.RESTOCKS, []);
  }

  async getById(id: string): Promise<RestockLog | null> {
    const list = await this.getAll();
    return list.find(r => r.id === id) || null;
  }

  async getByProductId(productId: string): Promise<RestockLog[]> {
    const list = await this.getAll();
    return list.filter(r => r.productId === productId);
  }

  async create(data: Omit<RestockLog, 'id' | 'createdAt'>): Promise<RestockLog> {
    const list = await this.getAll();
    const newRestock: RestockLog = {
      ...data,
      id: `rst-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRestock, ...list];
    await setItem(STORAGE_KEYS.RESTOCKS, updated);
    return newRestock;
  }
}

export const restockRepository = new AsyncRestockRepository();
