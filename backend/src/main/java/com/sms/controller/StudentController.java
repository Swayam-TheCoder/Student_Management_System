package com.sms.controller;

import com.sms.common.response.ApiResponse;
import com.sms.common.response.PagedResponse;
import com.sms.dto.response.PointTransactionDto;
import com.sms.dto.response.StudentDetailDto;
import com.sms.security.UserPrincipal;
import com.sms.service.PointService;
import com.sms.service.StudentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;
    private final PointService pointService;

    public StudentController(StudentService studentService, PointService pointService) {
        this.studentService = studentService;
        this.pointService = pointService;
    }

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PagedResponse<StudentDetailDto>>> getStudents(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "totalPoints,desc") String sort) {

        Pageable pageable = createPageable(page, size, sort);
        PagedResponse<StudentDetailDto> response = studentService.getAllStudents(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or (hasRole('STUDENT') and #id == principal.profileId)")
    public ResponseEntity<ApiResponse<StudentDetailDto>> getStudentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentDetailDto student = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDetailDto>> getMyProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentDetailDto student = studentService.getStudentById(principal.getProfileId());
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @GetMapping("/{id}/transactions")
    @PreAuthorize("hasRole('TEACHER') or (hasRole('STUDENT') and #id == principal.profileId)")
    public ResponseEntity<ApiResponse<PagedResponse<PointTransactionDto>>> getStudentTransactions(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal UserPrincipal principal) {

        Pageable pageable = createPageable(page, size, sort);
        PagedResponse<PointTransactionDto> transactions = pointService.getStudentTransactions(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    private Pageable createPageable(int page, int size, String sort) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));

        String[] sortParts = sort.split(",");
        String sortField = sortParts[0].trim();
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].trim().equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(safePage, safeSize, Sort.by(direction, sortField));
    }
}

