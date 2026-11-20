package com.sms.dto.response;

public class UserProfileResponse {

    private UserDto user;
    private StudentProfileDto studentProfile;
    private TeacherProfileDto teacherProfile;

    public UserProfileResponse() {
    }

    public UserProfileResponse(UserDto user, StudentProfileDto studentProfile, TeacherProfileDto teacherProfile) {
        this.user = user;
        this.studentProfile = studentProfile;
        this.teacherProfile = teacherProfile;
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

