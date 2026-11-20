package com.sms.dto.response;

public class LeaderboardEntryDto {

    private Long rank;
    private Long studentId;
    private String studentName;
    private String studentIdNumber;
    private String gradeLevel;
    private int totalPoints;

    public LeaderboardEntryDto() {
    }

    public LeaderboardEntryDto(Long rank, Long studentId, String studentName, String studentIdNumber, String gradeLevel, int totalPoints) {
        this.rank = rank;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentIdNumber = studentIdNumber;
        this.gradeLevel = gradeLevel;
        this.totalPoints = totalPoints;
    }

    public Long getRank() {
        return rank;
    }

    public void setRank(Long rank) {
        this.rank = rank;
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

    public String getStudentIdNumber() {
        return studentIdNumber;
    }

    public void setStudentIdNumber(String studentIdNumber) {
        this.studentIdNumber = studentIdNumber;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }
}

