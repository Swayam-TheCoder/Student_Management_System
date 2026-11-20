package com.sms.service;

import com.sms.common.response.PagedResponse;
import com.sms.dto.response.LeaderboardEntryDto;

public interface LeaderboardService {
    PagedResponse<LeaderboardEntryDto> getLeaderboard(int page, int size);
}

