package com.sms.controller;

import com.sms.common.response.ApiResponse;
import com.sms.common.response.PagedResponse;
import com.sms.dto.response.LeaderboardEntryDto;
import com.sms.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<PagedResponse<LeaderboardEntryDto>>> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<LeaderboardEntryDto> leaderboard = leaderboardService.getLeaderboard(page, size);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}

