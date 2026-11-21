import { StudentDetail } from './student';

export interface ClassRoom {
  id: number;
  className: string;
  subject: string;
  section: string;
  enrollmentCode: string;
  teacherId: number;
  teacherName: string;
  studentCount: number;
  createdAt: string;
}

export interface ClassEnrollment {
  id: number;
  classId: number;
  className: string;
  subject: string;
  section: string;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  studentIdNumber: string;
  enrolledAt: string;
}

export interface ClassStudent {
  enrollmentId: number;
  studentId: number;
  userId: number;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: string;
  totalPoints: number;
  enrolledAt: string;
}

export interface CreateClassPayload {
  className: string;
  subject: string;
  section: string;
}

export interface JoinClassPayload {
  enrollmentCode: string;
}
