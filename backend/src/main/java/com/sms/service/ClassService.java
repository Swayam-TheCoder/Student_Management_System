package com.sms.service;

import com.sms.dto.request.CreateClassRequest;
import com.sms.dto.request.JoinClassRequest;
import com.sms.dto.response.ClassEnrollmentDto;
import com.sms.dto.response.ClassRoomDto;
import com.sms.dto.response.StudentDetailDto;

import java.util.List;

public interface ClassService {

    ClassRoomDto createClass(Long teacherProfileId, CreateClassRequest request);

    List<ClassRoomDto> getTeacherClasses(Long teacherProfileId);

    ClassEnrollmentDto joinClass(Long studentProfileId, JoinClassRequest request);

    List<ClassEnrollmentDto> getStudentEnrolledClasses(Long studentProfileId);

    List<StudentDetailDto> getClassStudents(Long teacherProfileId, Long classId);
}
