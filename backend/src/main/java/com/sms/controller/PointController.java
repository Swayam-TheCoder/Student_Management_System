package com.sms.controller;

import com.sms.common.response.ApiResponse;
import com.sms.dto.request.AwardPointsRequest;
import com.sms.dto.response.AwardPointsResponse;
import com.sms.model.enums.TransactionType;
import com.sms.security.UserPrincipal;
import com.sms.service.PointService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/points")
public class PointController {

    private final PointService pointService;

    public PointController(PointService pointService) {
        this.pointService = pointService;
    }

    @PostMapping("/award")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<AwardPointsResponse>> awardPoints(
            @Valid @RequestBody AwardPointsRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        AwardPointsResponse response = pointService.awardPoints(principal.getProfileId(), request);
        return ResponseEntity.ok(ApiResponse.success("Points awarded successfully", response));
    }

    @GetMapping("/types")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<TransactionType>>> getTransactionTypes() {
        List<TransactionType> types = pointService.getTransactionTypes();
        return ResponseEntity.ok(ApiResponse.success(types));
    }
}

