package com.sms.service.impl;

import com.sms.common.response.PagedResponse;
import com.sms.dto.response.LeaderboardEntryDto;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.projection.LeaderboardProjection;
import com.sms.service.LeaderboardService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    private final StudentProfileRepository studentProfileRepository;

    public LeaderboardServiceImpl(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<LeaderboardEntryDto> getLeaderboard(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));

        Page<LeaderboardProjection> projectionPage = studentProfileRepository.getLeaderboard(
                PageRequest.of(safePage, safeSize)
        );

        List<LeaderboardEntryDto> entries = projectionPage.getContent().stream()
                .map(p -> new LeaderboardEntryDto(
                        p.getRank(),
                        p.getStudentId(),
                        p.getStudentName(),
                        p.getStudentIdNumber(),
                        p.getGradeLevel(),
                        p.getTotalPoints() != null ? p.getTotalPoints() : 0
                ))
                .toList();

        return new PagedResponse<>(
                entries,
                projectionPage.getNumber(),
                projectionPage.getSize(),
                projectionPage.getTotalElements(),
                projectionPage.getTotalPages(),
                projectionPage.isLast()
        );
    }
}

