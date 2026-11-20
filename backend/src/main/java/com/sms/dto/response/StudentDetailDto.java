package com.sms.dto.response;

import java.time.Instant;

public class StudentDetailDto {

    private Long id;
    private Long userId;
    private String studentIdNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String gradeLevel;
    private int totalPoints;
    private Instant createdAt;
    private Instant updatedAt;

    public StudentDetailDto() {
    }

    public StudentDetailDto(Long id, Long userId, String studentIdNumber, String firstName,
                            String lastName, String email, String gradeLevel, int totalPoints,
                            Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.studentIdNumber = studentIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.gradeLevel = gradeLevel;
        this.totalPoints = totalPoints;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentIdNumber() {
        return studentIdNumber;
    }

    public void setStudentIdNumber(String studentIdNumber) {
        this.studentIdNumber = studentIdNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}

