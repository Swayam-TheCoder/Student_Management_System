package com.sms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class JoinClassRequest {

    @NotBlank(message = "Enrollment code is required")
    @Size(min = 4, max = 16, message = "Enrollment code must be between 4 and 16 characters")
    private String enrollmentCode;

    public JoinClassRequest() {
    }

    public JoinClassRequest(String enrollmentCode) {
        this.enrollmentCode = enrollmentCode;
    }

    public String getEnrollmentCode() {
        return enrollmentCode;
    }

    public void setEnrollmentCode(String enrollmentCode) {
        this.enrollmentCode = enrollmentCode;
    }
}
