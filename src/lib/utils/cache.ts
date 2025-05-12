import { logger } from './logger.js';

interface CacheOptions {
  ttl: number; // Time to live in milliseconds
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private readonly defaultTTL: number;

  constructor(options: CacheOptions = { ttl: 5 * 60 * 1000 }) { // Default 5 minutes
    this.defaultTTL = options.ttl;
  }

  set(key: string, value: T, ttl: number = this.defaultTTL): void {
    const expiresAt = Date.now() + ttl;
    this.store.set(key, { value, expiresAt });
    logger.debug(`Cache set: ${key}`, { ttl, expiresAt });
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    
    if (!entry) {
      logger.debug(`Cache miss: ${key}`);
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      logger.debug(`Cache expired: ${key}`);
      this.store.delete(key);
      return undefined;
    }

    logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  delete(key: string): void {
    this.store.delete(key);
    logger.debug(`Cache deleted: ${key}`);
  }

  clear(): void {
    this.store.clear();
    logger.debug('Cache cleared');
  }

  async getOrSet(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetchFn();
    this.set(key, value, ttl);
    return value;
  }
}