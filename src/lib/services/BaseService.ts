import { supabase } from '../supabase.js';
import { BaseModel } from '../types/base.js';
import { NotFoundError, AppError } from '../errors/AppError.js';
import { PaginationParams, PaginatedResponse, validatePaginationParams } from '../utils/pagination.js';
import { logger } from '../utils/logger.js';
import { Cache } from '../utils/cache.js';

export abstract class BaseService<T extends BaseModel> {
  protected abstract tableName: string;
  private cache: Cache<T>;
  private listCache: Cache<PaginatedResponse<T>>;

  constructor() {
    this.cache = new Cache<T>({ ttl: 5 * 60 * 1000 }); // 5 minutes
    this.listCache = new Cache<PaginatedResponse<T>>({ ttl: 1 * 60 * 1000 }); // 1 minute
  }

  private getCacheKey(id: string): string {
    return `${this.tableName}:${id}`;
  }

  private getListCacheKey(query: any, pagination: any): string {
    return `${this.tableName}:list:${JSON.stringify(query)}:${JSON.stringify(pagination)}`;
  }

  async findById(id: string): Promise<T> {
    const cacheKey = this.getCacheKey(id);
    
    try {
      return await this.cache.getOrSet(cacheKey, async () => {
        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) throw new NotFoundError(this.tableName);

        return data as T;
      });
    } catch (error) {
      logger.error(`Error fetching ${this.tableName} by ID`, error);
      throw this.handleError(error);
    }
  }

  async findAll(query: Partial<T> = {}): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .match(query);

    if (error) throw this.handleError(error);
    return (data || []) as T[];
  }

  async findAllPaginated(
    query: Partial<T> = {}, 
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<T>> {
    const cacheKey = this.getListCacheKey(query, pagination);
    
    try {
      return await this.listCache.getOrSet(cacheKey, async () => {
        const { page, pageSize, sortBy, sortOrder } = validatePaginationParams(pagination);
        const offset = (page - 1) * pageSize;

        const { count: totalItems } = await supabase
          .from(this.tableName)
          .select('*', { count: 'exact', head: true })
          .match(query);

        if (totalItems === null) {
          throw new Error('Failed to get total count');
        }

        const { data, error } = await supabase
          .from(this.tableName)
          .select('*')
          .match(query)
          .order(sortBy, { ascending: sortOrder === 'asc' })
          .range(offset, offset + pageSize - 1);

        if (error) throw error;

        return {
          data: data as T[],
          metadata: {
            currentPage: page,
            pageSize,
            totalPages: Math.ceil(totalItems / pageSize),
            totalItems
          }
        };
      });
    } catch (error) {
      logger.error(`Error fetching paginated ${this.tableName}`, error);
      throw this.handleError(error);
    }
  }

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) throw this.handleError(error);
    if (!created) throw new AppError('Failed to create record', 500);

    // Invalidate list cache when new item is created
    this.listCache.clear();
    return created as T;
  }

  async update(id: string, data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): Promise<T> {
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update({ ...data, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw this.handleError(error);
    if (!updated) throw new NotFoundError(this.tableName);

    // Invalidate both individual and list caches
    this.cache.delete(this.getCacheKey(id));
    this.listCache.clear();
    
    return updated as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) throw this.handleError(error);

    // Invalidate both individual and list caches
    this.cache.delete(this.getCacheKey(id));
    this.listCache.clear();
  }

  protected handleError(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }

    logger.error(`${this.tableName} operation failed`, error);

    if (error?.code === '23505') {
      return new AppError('Record already exists', 409, 'DUPLICATE_RECORD');
    }

    if (error?.code === '23503') {
      return new AppError('Referenced record does not exist', 400, 'FOREIGN_KEY_VIOLATION');
    }

    if (error?.code === '42P01') {
      return new AppError('Table does not exist', 500, 'TABLE_NOT_FOUND');
    }

    return new AppError(
      error?.message || 'An unexpected error occurred',
      error?.code ? 400 : 500,
      'DATABASE_ERROR'
    );
  }
}