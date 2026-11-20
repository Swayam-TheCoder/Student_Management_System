package com.sms.dto.response;

import java.time.Instant;

public class TeacherProfileDto {

    private Long id;
    private String employeeId;
    private String department;
    private Instant createdAt;

    public TeacherProfileDto() {
    }

    public TeacherProfileDto(Long id, String employeeId, String department, Instant createdAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.department = department;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}

