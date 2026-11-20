import { apiClient } from './client';
import { ApiResponse, PagedResponse } from '../types/api';
import { LeaderboardEntry } from '../types/leaderboard';

export const leaderboardApi = {
  async getLeaderboard(page: number = 0, size: number = 20): Promise<PagedResponse<LeaderboardEntry>> {
    const res = await apiClient.get<ApiResponse<PagedResponse<LeaderboardEntry>>>('/leaderboard', {
      params: { page, size },
    });
    return res.data.data;
  },
};

