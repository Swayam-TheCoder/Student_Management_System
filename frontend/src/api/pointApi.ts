import { apiClient } from './client';
import { ApiResponse } from '../types/api';
import { AwardPointsPayload, AwardPointsResult, TransactionType } from '../types/points';

export const pointApi = {
  async awardPoints(payload: AwardPointsPayload): Promise<AwardPointsResult> {
    const res = await apiClient.post<ApiResponse<AwardPointsResult>>('/points/award', payload);
    return res.data.data;
  },

  async getTransactionTypes(): Promise<TransactionType[]> {
    const res = await apiClient.get<ApiResponse<TransactionType[]>>('/points/types');
    return res.data.data;
  },
};

