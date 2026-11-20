package com.sms.service.impl;

import com.sms.common.exception.BadRequestException;
import com.sms.common.exception.DuplicateResourceException;
import com.sms.common.exception.ResourceNotFoundException;
import com.sms.dto.request.LoginRequest;
import com.sms.dto.request.RegisterRequest;
import com.sms.dto.response.AuthResponse;
import com.sms.dto.response.StudentProfileDto;
import com.sms.dto.response.TeacherProfileDto;
import com.sms.dto.response.UserDto;
import com.sms.dto.response.UserProfileResponse;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.TeacherProfile;
import com.sms.model.entity.User;
import com.sms.model.enums.Role;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.TeacherProfileRepository;
import com.sms.repository.UserRepository;
import com.sms.security.JwtTokenProvider;
import com.sms.security.UserPrincipal;
import com.sms.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.security.teacher-invitation-code:TEACHER_SECRET_2026}")
    private String configuredTeacherInvitationCode;

    public AuthServiceImpl(UserRepository userRepository,
                           StudentProfileRepository studentProfileRepository,
                           TeacherProfileRepository teacherProfileRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("An account with email '" + normalizedEmail + "' already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(request.getRole());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        StudentProfileDto studentProfileDto = null;
        TeacherProfileDto teacherProfileDto = null;
        Long profileId = null;

        if (request.getRole() == Role.STUDENT) {
            if (!StringUtils.hasText(request.getStudentIdNumber())) {
                throw new BadRequestException("Student ID number is required for student registration");
            }
            if (!StringUtils.hasText(request.getGradeLevel())) {
                throw new BadRequestException("Grade level is required for student registration");
            }
            if (studentProfileRepository.existsByStudentIdNumber(request.getStudentIdNumber().trim())) {
                throw new DuplicateResourceException("Student ID number '" + request.getStudentIdNumber() + "' is already registered");
            }

            StudentProfile studentProfile = new StudentProfile(
                    savedUser,
                    request.getStudentIdNumber().trim(),
                    request.getGradeLevel().trim()
            );
            StudentProfile savedProfile = studentProfileRepository.save(studentProfile);
            profileId = savedProfile.getId();
            studentProfileDto = mapToStudentProfileDto(savedProfile);

        } else if (request.getRole() == Role.TEACHER) {
            if (!StringUtils.hasText(request.getInvitationCode()) ||
                    !request.getInvitationCode().trim().equals(configuredTeacherInvitationCode)) {
                throw new BadRequestException("Invalid or missing teacher invitation code");
            }
            if (!StringUtils.hasText(request.getEmployeeId())) {
                throw new BadRequestException("Employee ID is required for teacher registration");
            }
            if (!StringUtils.hasText(request.getDepartment())) {
                throw new BadRequestException("Department is required for teacher registration");
            }
            if (teacherProfileRepository.existsByEmployeeId(request.getEmployeeId().trim())) {
                throw new DuplicateResourceException("Employee ID '" + request.getEmployeeId() + "' is already registered");
            }

            TeacherProfile teacherProfile = new TeacherProfile(
                    savedUser,
                    request.getEmployeeId().trim(),
                    request.getDepartment().trim()
            );
            TeacherProfile savedProfile = teacherProfileRepository.save(teacherProfile);
            profileId = savedProfile.getId();
            teacherProfileDto = mapToTeacherProfileDto(savedProfile);
        }

        UserPrincipal userPrincipal = UserPrincipal.create(savedUser, profileId);
        String token = jwtTokenProvider.generateToken(userPrincipal);

        return new AuthResponse(token, mapToUserDto(savedUser), studentProfileDto, teacherProfileDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(userPrincipal);

        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        StudentProfileDto studentProfileDto = null;
        TeacherProfileDto teacherProfileDto = null;

        if (user.getRole() == Role.STUDENT) {
            studentProfileDto = studentProfileRepository.findByUserId(user.getId())
                    .map(this::mapToStudentProfileDto)
                    .orElse(null);
        } else if (user.getRole() == Role.TEACHER) {
            teacherProfileDto = teacherProfileRepository.findByUserId(user.getId())
                    .map(this::mapToTeacherProfileDto)
                    .orElse(null);
        }

        return new AuthResponse(token, mapToUserDto(user), studentProfileDto, teacherProfileDto);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(UserPrincipal userPrincipal) {
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userPrincipal.getId()));

        StudentProfileDto studentProfileDto = null;
        TeacherProfileDto teacherProfileDto = null;

        if (user.getRole() == Role.STUDENT) {
            studentProfileDto = studentProfileRepository.findByUserId(user.getId())
                    .map(this::mapToStudentProfileDto)
                    .orElse(null);
        } else if (user.getRole() == Role.TEACHER) {
            teacherProfileDto = teacherProfileRepository.findByUserId(user.getId())
                    .map(this::mapToTeacherProfileDto)
                    .orElse(null);
        }

        return new UserProfileResponse(mapToUserDto(user), studentProfileDto, teacherProfileDto);
    }

    private UserDto mapToUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }

    private StudentProfileDto mapToStudentProfileDto(StudentProfile profile) {
        return new StudentProfileDto(
                profile.getId(),
                profile.getStudentIdNumber(),
                profile.getGradeLevel(),
                profile.getTotalPoints(),
                profile.getCreatedAt()
        );
    }

    private TeacherProfileDto mapToTeacherProfileDto(TeacherProfile profile) {
        return new TeacherProfileDto(
                profile.getId(),
                profile.getEmployeeId(),
                profile.getDepartment(),
                profile.getCreatedAt()
        );
    }
}

