export type Role = 'STUDENT' | 'TEACHER';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: number;
  studentIdNumber: string;
  gradeLevel: string;
  totalPoints: number;
  createdAt: string;
}

export interface TeacherProfile {
  id: number;
  employeeId: string;
  department: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
}

export interface UserProfileResponse {
  user: User;
  studentProfile?: StudentProfile | null;
  teacherProfile?: TeacherProfile | null;
}

export interface RegisterStudentPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT';
  studentIdNumber: string;
  gradeLevel: string;
}

export interface RegisterTeacherPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'TEACHER';
  employeeId: string;
  department: string;
  invitationCode: string;
}

export type RegisterPayload = RegisterStudentPayload | RegisterTeacherPayload;

export interface LoginPayload {
  email: string;
  password: string;
}

