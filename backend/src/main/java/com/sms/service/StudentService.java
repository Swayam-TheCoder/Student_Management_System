package com.sms.service;

import com.sms.common.response.PagedResponse;
import com.sms.dto.response.StudentDetailDto;
import org.springframework.data.domain.Pageable;

public interface StudentService {
    PagedResponse<StudentDetailDto> getAllStudents(String query, Pageable pageable);
    StudentDetailDto getStudentById(Long id);
    StudentDetailDto getStudentByUserId(Long userId);
}

