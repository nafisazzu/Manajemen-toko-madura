import { User } from '@/types';
import { IAuthRepository } from './types';
import { getItem, setItem, removeItem, STORAGE_KEYS } from '../storage/asyncStorage';
import { SEED_USERS } from '@/constants/SeedData';

export class AsyncAuthRepository implements IAuthRepository {
  async getUsers(): Promise<User[]> {
    return SEED_USERS;
  }

  async getCurrentUser(): Promise<User | null> {
    return getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  async setCurrentUser(user: User | null): Promise<void> {
    if (user) {
      await setItem(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      await removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  async login(roleOrUsername: string, pin: string): Promise<User | null> {
    const users = await this.getUsers();
    const cleanInput = roleOrUsername.trim().toLowerCase();
    const cleanPin = pin.trim();

    const matched = users.find(
      u => (u.role.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput) &&
           u.pin === cleanPin
    );

    if (matched) {
      await this.setCurrentUser(matched);
      return matched;
    }

    return null;
  }
}

export const authRepository = new AsyncAuthRepository();
