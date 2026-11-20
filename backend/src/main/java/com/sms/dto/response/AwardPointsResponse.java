package com.sms.dto.response;

public class AwardPointsResponse {

    private Long studentId;
    private String studentName;
    private int updatedTotalPoints;
    private PointTransactionDto transaction;

    public AwardPointsResponse() {
    }

    public AwardPointsResponse(Long studentId, String studentName, int updatedTotalPoints, PointTransactionDto transaction) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.updatedTotalPoints = updatedTotalPoints;
        this.transaction = transaction;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public int getUpdatedTotalPoints() {
        return updatedTotalPoints;
    }

    public void setUpdatedTotalPoints(int updatedTotalPoints) {
        this.updatedTotalPoints = updatedTotalPoints;
    }

    public PointTransactionDto getTransaction() {
        return transaction;
    }

    public void setTransaction(PointTransactionDto transaction) {
        this.transaction = transaction;
    }
}

