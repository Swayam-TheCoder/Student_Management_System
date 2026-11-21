package com.sms.service;

import com.sms.common.response.PagedResponse;
import com.sms.dto.request.AwardPointsRequest;
import com.sms.dto.response.AwardPointsResponse;
import com.sms.dto.response.PointTransactionDto;
import com.sms.model.enums.TransactionType;
import com.sms.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PointService {
    AwardPointsResponse awardPoints(Long teacherProfileId, AwardPointsRequest request);
    PagedResponse<PointTransactionDto> getStudentTransactions(Long studentProfileId, Pageable pageable);
    PagedResponse<PointTransactionDto> getStudentTransactionsForPrincipal(Long studentProfileId, UserPrincipal principal, Pageable pageable);
    List<TransactionType> getTransactionTypes();
}
