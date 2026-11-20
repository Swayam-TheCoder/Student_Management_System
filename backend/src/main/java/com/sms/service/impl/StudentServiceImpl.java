package com.sms.service.impl;

import com.sms.common.exception.ResourceNotFoundException;
import com.sms.common.response.PagedResponse;
import com.sms.dto.response.StudentDetailDto;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.User;
import com.sms.repository.StudentProfileRepository;
import com.sms.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository studentProfileRepository;

    public StudentServiceImpl(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentDetailDto> getAllStudents(String query, Pageable pageable) {
        Page<StudentProfile> studentsPage = studentProfileRepository.searchStudents(query, pageable);
        List<StudentDetailDto> content = studentsPage.getContent().stream()
                .map(this::mapToDetailDto)
                .toList();

        return new PagedResponse<>(
                content,
                studentsPage.getNumber(),
                studentsPage.getSize(),
                studentsPage.getTotalElements(),
                studentsPage.getTotalPages(),
                studentsPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDetailDto getStudentById(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));
        return mapToDetailDto(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDetailDto getStudentByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", userId));
        return mapToDetailDto(profile);
    }

    private StudentDetailDto mapToDetailDto(StudentProfile profile) {
        User user = profile.getUser();
        return new StudentDetailDto(
                profile.getId(),
                user.getId(),
                profile.getStudentIdNumber(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                profile.getGradeLevel(),
                profile.getTotalPoints(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}

