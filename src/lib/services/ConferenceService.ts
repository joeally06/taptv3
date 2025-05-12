import { Conference } from '../types/base.js';
import { BaseService } from './BaseService.js';
import { validate, rules } from '../validation.js';
import { ValidationError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { supabase } from '../supabase.js';

interface SearchParams {
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: Conference['status'];
}

export class ConferenceService extends BaseService<Conference> {
  protected tableName = 'conferences';

  async searchConferences(params: SearchParams) {
    let query = supabase.from(this.tableName).select('*');

    if (params.searchTerm) {
      query = query.or(`name.ilike.%${params.searchTerm}%,location.ilike.%${params.searchTerm}%`);
    }

    if (params.startDate) {
      query = query.gte('startDate', params.startDate.toISOString());
    }

    if (params.endDate) {
      query = query.lte('endDate', params.endDate.toISOString());
    }

    if (params.location) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.minPrice !== undefined) {
      query = query.gte('price', params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query = query.lte('price', params.maxPrice);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Conference search failed', { error, params });
      throw this.handleError(error);
    }

    return data as Conference[];
  }

  async createConference(data: Omit<Conference, 'id' | 'created_at' | 'updated_at' | 'currentAttendees'>) {
    try {
      // Validate conference data
      validate(data.name, [
        rules.required('Conference name'),
        rules.maxLength('Conference name', 100)
      ]);

      validate(data.startDate, [
        rules.required('Start date'),
        rules.future('Start date')
      ]);

      validate(data.endDate, [
        rules.required('End date'),
        rules.future('End date')
      ]);

      if (new Date(data.endDate) <= new Date(data.startDate)) {
        throw new ValidationError('End date must be after start date');
      }

      if (data.registrationDeadline && new Date(data.registrationDeadline) >= new Date(data.startDate)) {
        throw new ValidationError('Registration deadline must be before start date');
      }

      validate(data.maxAttendees, [
        rules.required('Maximum attendees'),
        rules.numeric('Maximum attendees'),
        rules.min('Maximum attendees', 1)
      ]);

      validate(data.price, [
        rules.required('Price'),
        rules.numeric('Price'),
        rules.min('Price', 0)
      ]);

      return await this.create({
        ...data,
        currentAttendees: 0,
        status: 'draft'
      });
    } catch (error) {
      logger.error('Failed to create conference', error);
      throw error;
    }
  }

  async updateStatus(id: string, status: Conference['status']) {
    return await this.update(id, { status });
  }

  async isAvailable(id: string): Promise<boolean> {
    const conference = await this.findById(id);
    return (
      conference.status === 'published' &&
      conference.currentAttendees < conference.maxAttendees &&
      new Date() <= new Date(conference.registrationDeadline)
    );
  }

  async incrementAttendees(id: string) {
    const conference = await this.findById(id);
    if (conference.currentAttendees >= conference.maxAttendees) {
      throw new ValidationError('Conference has reached maximum capacity');
    }
    return this.update(id, {
      currentAttendees: conference.currentAttendees + 1
    });
  }

  async decrementAttendees(id: string) {
    const conference = await this.findById(id);
    return this.update(id, {
      currentAttendees: Math.max(0, conference.currentAttendees - 1)
    });
  }
}