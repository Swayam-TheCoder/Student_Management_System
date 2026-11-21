package com.sms.service;

import com.sms.dto.request.CreateClassRequest;
import com.sms.dto.request.JoinClassRequest;
import com.sms.dto.response.ClassEnrollmentDto;
import com.sms.dto.response.ClassRoomDto;
import com.sms.dto.response.ClassStudentDto;

import java.util.List;

public interface ClassService {

    ClassRoomDto createClass(Long teacherProfileId, CreateClassRequest request);

    List<ClassRoomDto> getTeacherClasses(Long teacherProfileId);

    ClassRoomDto getClassById(Long teacherProfileId, Long classId);

    ClassRoomDto regenerateEnrollmentCode(Long teacherProfileId, Long classId);

    ClassEnrollmentDto joinClass(Long studentProfileId, JoinClassRequest request);

    List<ClassEnrollmentDto> getStudentEnrolledClasses(Long studentProfileId);

    List<ClassStudentDto> getClassStudents(Long teacherProfileId, Long classId, String query);
}
