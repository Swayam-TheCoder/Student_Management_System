package com.sms.service.impl;

import com.sms.common.exception.ForbiddenException;
import com.sms.common.exception.ResourceNotFoundException;
import com.sms.common.response.PagedResponse;
import com.sms.dto.response.StudentDetailDto;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.User;
import com.sms.model.enums.Role;
import com.sms.repository.ClassEnrollmentRepository;
import com.sms.repository.StudentProfileRepository;
import com.sms.security.UserPrincipal;
import com.sms.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentServiceImpl implements StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;

    public StudentServiceImpl(StudentProfileRepository studentProfileRepository,
                              ClassEnrollmentRepository classEnrollmentRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
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
    public PagedResponse<StudentDetailDto> getTeacherStudents(Long teacherProfileId, String query, Pageable pageable) {
        String cleanQuery = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        Page<StudentProfile> studentsPage = studentProfileRepository.findTeacherEnrolledStudents(teacherProfileId, cleanQuery, pageable);
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
    public StudentDetailDto getStudentByIdForPrincipal(Long id, UserPrincipal principal) {
        if (principal.getRole() == Role.TEACHER) {
            boolean isEnrolled = classEnrollmentRepository.isStudentEnrolledInTeacherClasses(id, principal.getProfileId());
            if (!isEnrolled) {
                throw new ForbiddenException("Access Denied: You can only view profiles of students enrolled in your classes.");
            }
        } else if (principal.getRole() == Role.STUDENT) {
            if (!id.equals(principal.getProfileId())) {
                throw new ForbiddenException("Access Denied: You cannot view other students' private profiles.");
            }
        }
        return getStudentById(id);
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
