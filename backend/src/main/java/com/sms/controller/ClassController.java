package com.sms.controller;

import com.sms.common.response.ApiResponse;
import com.sms.dto.request.CreateClassRequest;
import com.sms.dto.request.JoinClassRequest;
import com.sms.dto.response.ClassEnrollmentDto;
import com.sms.dto.response.ClassRoomDto;
import com.sms.dto.response.StudentDetailDto;
import com.sms.security.UserPrincipal;
import com.sms.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
public class ClassController {

    private final ClassService classService;

    public ClassController(ClassService classService) {
        this.classService = classService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<ClassRoomDto>> createClass(
            @Valid @RequestBody CreateClassRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ClassRoomDto response = classService.createClass(principal.getProfileId(), request);
        return ResponseEntity.ok(ApiResponse.success("Class created successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<ClassRoomDto>>> getMyClasses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ClassRoomDto> response = classService.getTeacherClasses(principal.getProfileId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ClassEnrollmentDto>> joinClass(
            @Valid @RequestBody JoinClassRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        ClassEnrollmentDto response = classService.joinClass(principal.getProfileId(), request);
        return ResponseEntity.ok(ApiResponse.success("Enrolled in class successfully", response));
    }

    @GetMapping("/enrolled")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ClassEnrollmentDto>>> getEnrolledClasses(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ClassEnrollmentDto> response = classService.getStudentEnrolledClasses(principal.getProfileId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{classId}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<StudentDetailDto>>> getClassStudents(
            @PathVariable Long classId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<StudentDetailDto> response = classService.getClassStudents(principal.getProfileId(), classId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
