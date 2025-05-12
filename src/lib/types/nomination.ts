export interface Nomination {
  name: string;
  description: string;
  submittedBy?: string;
  submittedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface CreateNominationDTO {
  name: string;
  description: string;
  submittedBy?: string;
}