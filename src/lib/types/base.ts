export interface BaseModel {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface User extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  organization?: string;
}

export interface Conference extends BaseModel {
  name: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxAttendees: number;
  currentAttendees: number;
  price: number;
  registrationDeadline: Date;
  status: 'draft' | 'published' | 'cancelled';
}

export interface Registration extends BaseModel {
  conferenceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'cancelled';
  amount: number;
  attendeeInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BoardMember extends BaseModel {
  name: string;
  title: string;
  district: string;
  email: string;
  phone?: string;
  imageUrl?: string;
  active: boolean;
}