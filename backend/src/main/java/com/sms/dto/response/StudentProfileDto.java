package com.sms.dto.response;

import java.time.Instant;

public class StudentProfileDto {

    private Long id;
    private String studentIdNumber;
    private String gradeLevel;
    private int totalPoints;
    private Instant createdAt;

    public StudentProfileDto() {
    }

    public StudentProfileDto(Long id, String studentIdNumber, String gradeLevel, int totalPoints, Instant createdAt) {
        this.id = id;
        this.studentIdNumber = studentIdNumber;
        this.gradeLevel = gradeLevel;
        this.totalPoints = totalPoints;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

