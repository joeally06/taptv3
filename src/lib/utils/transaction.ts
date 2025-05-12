import { supabase } from '../supabase.js';
import { AppError } from '../errors/AppError.js';
import { logger } from './logger.js';

export async function withTransaction<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    await supabase.rpc('begin_transaction');
    const result = await callback();
    await supabase.rpc('commit_transaction');
    return result;
  } catch (error) {
    logger.error('Transaction failed, rolling back', error);
    await supabase.rpc('rollback_transaction');
    throw error instanceof AppError ? error : new AppError('Transaction failed');
  }
}