package com.sms.service;

import com.sms.common.response.PagedResponse;
import com.sms.dto.response.StudentDetailDto;
import com.sms.security.UserPrincipal;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    PagedResponse<StudentDetailDto> getAllStudents(String query, Pageable pageable);
    PagedResponse<StudentDetailDto> getTeacherStudents(Long teacherProfileId, String query, Pageable pageable);
    StudentDetailDto getStudentById(Long id);
    StudentDetailDto getStudentByIdForPrincipal(Long id, UserPrincipal principal);
    StudentDetailDto getStudentByUserId(Long userId);
}
