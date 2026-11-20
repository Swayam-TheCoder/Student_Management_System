package com.sms.dto.response;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private UserDto user;
    private StudentProfileDto studentProfile;
    private TeacherProfileDto teacherProfile;

    public AuthResponse() {
    }

    public AuthResponse(String token, UserDto user, StudentProfileDto studentProfile, TeacherProfileDto teacherProfile) {
        this.token = token;
        this.tokenType = "Bearer";
        this.user = user;
        this.studentProfile = studentProfile;
        this.teacherProfile = teacherProfile;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public StudentProfileDto getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfileDto studentProfile) {
        this.studentProfile = studentProfile;
    }

    public TeacherProfileDto getTeacherProfile() {
        return teacherProfile;
    }

    public void setTeacherProfile(TeacherProfileDto teacherProfile) {
        this.teacherProfile = teacherProfile;
    }
}

