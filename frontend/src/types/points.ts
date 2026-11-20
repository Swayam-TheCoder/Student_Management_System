export type TransactionType =
  | 'ACADEMIC'
  | 'PARTICIPATION'
  | 'BEHAVIOR'
  | 'PENALTY'
  | 'ADJUSTMENT';

export interface PointTransaction {
  id: number;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  teacherId: number;
  teacherName: string;
  points: number;
  transactionType: TransactionType;
  reason: string;
  createdAt: string;
}

export interface AwardPointsPayload {
  studentId: number;
  points: number;
  transactionType: TransactionType;
  reason: string;
}

export interface AwardPointsResult {
  studentId: number;
  studentName: string;
  updatedTotalPoints: number;
  transaction: PointTransaction;
}

