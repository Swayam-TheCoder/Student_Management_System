import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { ClassEnrollment, ClassRoom, CreateClassPayload, JoinClassPayload } from '../types/class';
import { StudentDetail } from '../types/student';

export const classApi = {
  createClass: async (data: CreateClassPayload): Promise<ClassRoom> => {
    const res = await apiClient.post<ApiResponse<ClassRoom>>('/classes', data);
    return res.data.data;
  },

  getMyClasses: async (): Promise<ClassRoom[]> => {
    const res = await apiClient.get<ApiResponse<ClassRoom[]>>('/classes/my');
    return res.data.data;
  },

  joinClass: async (data: JoinClassPayload): Promise<ClassEnrollment> => {
    const res = await apiClient.post<ApiResponse<ClassEnrollment>>('/classes/join', data);
    return res.data.data;
  },

  getEnrolledClasses: async (): Promise<ClassEnrollment[]> => {
    const res = await apiClient.get<ApiResponse<ClassEnrollment[]>>('/classes/enrolled');
    return res.data.data;
  },

  getClassStudents: async (classId: number): Promise<StudentDetail[]> => {
    const res = await apiClient.get<ApiResponse<StudentDetail[]>>(`/classes/${classId}/students`);
    return res.data.data;
  },
};
