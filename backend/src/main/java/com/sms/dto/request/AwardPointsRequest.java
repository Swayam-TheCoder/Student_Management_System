package com.sms.dto.request;

import com.sms.model.enums.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AwardPointsRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Points value is required")
    private Integer points;

    @NotNull(message = "Transaction type is required")
    private TransactionType transactionType;

    @NotBlank(message = "Reason is required")
    @Size(min = 3, max = 500, message = "Reason must be between 3 and 500 characters")
    private String reason;

    public AwardPointsRequest() {
    }

    public AwardPointsRequest(Long studentId, Integer points, TransactionType transactionType, String reason) {
        this.studentId = studentId;
        this.points = points;
        this.transactionType = transactionType;
        this.reason = reason;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

