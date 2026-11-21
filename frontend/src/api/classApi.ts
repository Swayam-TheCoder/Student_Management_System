import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { ClassEnrollment, ClassRoom, ClassStudent, CreateClassPayload, JoinClassPayload } from '../types/class';

export const classApi = {
  createClass: async (data: CreateClassPayload): Promise<ClassRoom> => {
    const res = await apiClient.post<ApiResponse<ClassRoom>>('/classes', data);
    return res.data.data;
  },

  getMyClasses: async (): Promise<ClassRoom[]> => {
    const res = await apiClient.get<ApiResponse<ClassRoom[]>>('/classes/my');
    return res.data.data;
  },

  getClassById: async (classId: number): Promise<ClassRoom> => {
    const res = await apiClient.get<ApiResponse<ClassRoom>>(`/classes/${classId}`);
    return res.data.data;
  },

  getClassStudents: async (classId: number, query?: string): Promise<ClassStudent[]> => {
    const params: Record<string, string> = {};
    if (query && query.trim()) {
      params.query = query.trim();
    }
    const res = await apiClient.get<ApiResponse<ClassStudent[]>>(`/classes/${classId}/students`, { params });
    return res.data.data;
  },

  regenerateCode: async (classId: number): Promise<ClassRoom> => {
    const res = await apiClient.post<ApiResponse<ClassRoom>>(`/classes/${classId}/regenerate-code`);
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
};
