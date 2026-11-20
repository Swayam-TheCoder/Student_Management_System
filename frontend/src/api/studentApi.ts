import { apiClient } from './client';
import { ApiResponse, PagedResponse } from '../types/api';
import { StudentDetail } from '../types/student';
import { PointTransaction } from '../types/points';

export const studentApi = {
  async getStudents(
    query?: string,
    page: number = 0,
    size: number = 10,
    sort: string = 'totalPoints,desc'
  ): Promise<PagedResponse<StudentDetail>> {
    const params: Record<string, any> = { page, size, sort };
    if (query && query.trim()) {
      params.query = query.trim();
    }
    const res = await apiClient.get<ApiResponse<PagedResponse<StudentDetail>>>('/students', { params });
    return res.data.data;
  },

  async getStudentById(id: number): Promise<StudentDetail> {
    const res = await apiClient.get<ApiResponse<StudentDetail>>(`/students/${id}`);
    return res.data.data;
  },

  async getMyProfile(): Promise<StudentDetail> {
    const res = await apiClient.get<ApiResponse<StudentDetail>>('/students/me/profile');
    return res.data.data;
  },

  async getStudentTransactions(
    id: number,
    page: number = 0,
    size: number = 15,
    sort: string = 'createdAt,desc'
  ): Promise<PagedResponse<PointTransaction>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<PointTransaction>>>(
      `/students/${id}/transactions`,
      { params: { page, size, sort } }
    );
    return res.data.data;
  },
};

