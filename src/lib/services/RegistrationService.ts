import { Registration } from '../types/base.js';
import { BaseService } from './BaseService.js';
import { ConferenceService } from './ConferenceService.js';
import { validate, rules } from '../validation.js';
import { ValidationError } from '../errors/AppError.js';
import { withTransaction } from '../utils/transaction.js';
import { logger } from '../utils/logger.js';

export class RegistrationService extends BaseService<Registration> {
  protected tableName = 'registrations';
  private conferenceService = new ConferenceService();

  async createRegistration(data: Omit<Registration, 'id' | 'created_at' | 'updated_at' | 'status' | 'paymentStatus'>) {
    return withTransaction(async () => {
      // Check conference availability
      if (!await this.conferenceService.isAvailable(data.conferenceId)) {
        throw new ValidationError('Conference is not available for registration');
      }

      // Validate attendee info
      validate(data.attendeeInfo.name, [
        rules.required('Attendee name'),
        rules.maxLength('Attendee name', 100)
      ]);

      validate(data.attendeeInfo.email, [
        rules.required('Email'),
        rules.email()
      ]);

      validate(data.attendeeInfo.phone, [
        rules.required('Phone'),
        rules.phone()
      ]);

      validate(data.amount, [
        rules.required('Amount'),
        rules.numeric('Amount'),
        rules.min('Amount', 0)
      ]);

      // Create registration and update conference attendee count atomically
      const registration = await super.create({
        ...data,
        status: 'pending',
        paymentStatus: 'pending'
      });

      await this.conferenceService.incrementAttendees(data.conferenceId);
      
      logger.info('Registration created', { 
        registrationId: registration.id, 
        conferenceId: data.conferenceId 
      });

      return registration;
    });
  }

  async update(id: string, data: Partial<Pick<Registration, 'status' | 'paymentStatus'>>) {
    return super.update(id, data);
  }

  async confirmRegistration(id: string) {
    return withTransaction(async () => {
      const registration = await this.findById(id);
      
      if (registration.status !== 'pending') {
        throw new ValidationError('Only pending registrations can be confirmed');
      }

      const updated = await this.update(id, {
        status: 'confirmed',
        paymentStatus: 'paid'
      });

      logger.info('Registration confirmed', { registrationId: id });
      return updated;
    });
  }

  async cancelRegistration(id: string) {
    return withTransaction(async () => {
      const registration = await this.findById(id);
      
      if (registration.status === 'cancelled') {
        throw new ValidationError('Registration is already cancelled');
      }

      await this.conferenceService.decrementAttendees(registration.conferenceId);

      const newPaymentStatus = registration.paymentStatus === 'paid' ? 'refunded' : 
                              registration.paymentStatus === 'pending' ? 'cancelled' : 
                              registration.paymentStatus;

      const updated = await this.update(id, {
        status: 'cancelled',
        paymentStatus: newPaymentStatus
      });

      logger.info('Registration cancelled', { registrationId: id });
      return updated;
    });
  }

  async getRegistrationsByConference(conferenceId: string): Promise<Registration[]> {
    return this.findAll({ conferenceId });
  }

  async getRegistrationsByUser(userId: string): Promise<Registration[]> {
    return this.findAll({ userId });
  }
}