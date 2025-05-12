export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

export interface Conference extends BaseEntity {
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  registrationDeadline: Date;
}

export interface Registration extends BaseEntity {
  conferenceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  amount: number;
}