package com.sms.dto.response;

import java.time.Instant;

public class ClassRoomDto {

    private Long id;
    private String className;
    private String subject;
    private String section;
    private String enrollmentCode;
    private Long teacherId;
    private String teacherName;
    private long studentCount;
    private Instant createdAt;

    public ClassRoomDto() {
    }

    public ClassRoomDto(Long id, String className, String subject, String section, String enrollmentCode,
                        Long teacherId, String teacherName, long studentCount, Instant createdAt) {
        this.id = id;
        this.className = className;
        this.subject = subject;
        this.section = section;
        this.enrollmentCode = enrollmentCode;
        this.teacherId = teacherId;
        this.teacherName = teacherName;
        this.studentCount = studentCount;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getEnrollmentCode() {
        return enrollmentCode;
    }

    public void setEnrollmentCode(String enrollmentCode) {
        this.enrollmentCode = enrollmentCode;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
    }

    public String getTeacherName() {
        return teacherName;
    }

    public void setTeacherName(String teacherName) {
        this.teacherName = teacherName;
    }

    public long getStudentCount() {
        return studentCount;
    }

    public void setStudentCount(long studentCount) {
        this.studentCount = studentCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
