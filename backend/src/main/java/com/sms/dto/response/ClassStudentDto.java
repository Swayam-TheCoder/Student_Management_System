package com.sms.dto.response;

import java.time.Instant;

public class ClassStudentDto {

    private Long enrollmentId;
    private Long studentId;
    private Long userId;
    private String studentIdNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String gradeLevel;
    private int totalPoints;
    private Instant enrolledAt;

    public ClassStudentDto() {
    }

    public ClassStudentDto(Long enrollmentId, Long studentId, Long userId, String studentIdNumber,
                           String firstName, String lastName, String email, String gradeLevel,
                           int totalPoints, Instant enrolledAt) {
        this.enrollmentId = enrollmentId;
        this.studentId = studentId;
        this.userId = userId;
        this.studentIdNumber = studentIdNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.gradeLevel = gradeLevel;
        this.totalPoints = totalPoints;
        this.enrolledAt = enrolledAt;
    }

    public Long getEnrollmentId() {
        return enrollmentId;
    }

    public void setEnrollmentId(Long enrollmentId) {
        this.enrollmentId = enrollmentId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(Instant enrolledAt) {
        this.enrolledAt = enrolledAt;
    }
}
