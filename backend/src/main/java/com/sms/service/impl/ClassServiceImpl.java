package com.sms.service.impl;

import com.sms.common.exception.DuplicateResourceException;
import com.sms.common.exception.ForbiddenException;
import com.sms.common.exception.ResourceNotFoundException;
import com.sms.dto.request.CreateClassRequest;
import com.sms.dto.request.JoinClassRequest;
import com.sms.dto.response.ClassEnrollmentDto;
import com.sms.dto.response.ClassRoomDto;
import com.sms.dto.response.ClassStudentDto;
import com.sms.model.entity.ClassEnrollment;
import com.sms.model.entity.ClassRoom;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.TeacherProfile;
import com.sms.model.entity.User;
import com.sms.repository.ClassEnrollmentRepository;
import com.sms.repository.ClassRoomRepository;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.TeacherProfileRepository;
import com.sms.service.ClassService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;

@Service
public class ClassServiceImpl implements ClassService {

    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    private final ClassRoomRepository classRoomRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    public ClassServiceImpl(ClassRoomRepository classRoomRepository,
                            ClassEnrollmentRepository classEnrollmentRepository,
                            TeacherProfileRepository teacherProfileRepository,
                            StudentProfileRepository studentProfileRepository) {
        this.classRoomRepository = classRoomRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Override
    @Transactional
    public ClassRoomDto createClass(Long teacherProfileId, CreateClassRequest request) {
        TeacherProfile teacher = teacherProfileRepository.findById(teacherProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("TeacherProfile", "id", teacherProfileId));

        String code = generateUniqueCode();
        ClassRoom classRoom = new ClassRoom(
                teacher,
                request.getClassName().trim(),
                request.getSubject().trim(),
                request.getSection().trim(),
                code
        );

        ClassRoom saved = classRoomRepository.save(classRoom);
        String teacherName = teacher.getUser().getFirstName() + " " + teacher.getUser().getLastName();

        return new ClassRoomDto(
                saved.getId(),
                saved.getClassName(),
                saved.getSubject(),
                saved.getSection(),
                saved.getEnrollmentCode(),
                teacher.getId(),
                teacherName,
                0,
                saved.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassRoomDto> getTeacherClasses(Long teacherProfileId) {
        List<ClassRoom> classes = classRoomRepository.findByTeacherIdOrderByCreatedAtDesc(teacherProfileId);
        return classes.stream().map(c -> {
            long studentCount = classEnrollmentRepository.countByClassRoomId(c.getId());
            String teacherName = c.getTeacher().getUser().getFirstName() + " " + c.getTeacher().getUser().getLastName();
            return new ClassRoomDto(
                    c.getId(),
                    c.getClassName(),
                    c.getSubject(),
                    c.getSection(),
                    c.getEnrollmentCode(),
                    c.getTeacher().getId(),
                    teacherName,
                    studentCount,
                    c.getCreatedAt()
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ClassRoomDto getClassById(Long teacherProfileId, Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "id", classId));

        if (!classRoom.getTeacher().getId().equals(teacherProfileId)) {
            throw new ForbiddenException("Access Denied: You do not have access to this classroom.");
        }

        long studentCount = classEnrollmentRepository.countByClassRoomId(classId);
        String teacherName = classRoom.getTeacher().getUser().getFirstName() + " " + classRoom.getTeacher().getUser().getLastName();

        return new ClassRoomDto(
                classRoom.getId(),
                classRoom.getClassName(),
                classRoom.getSubject(),
                classRoom.getSection(),
                classRoom.getEnrollmentCode(),
                classRoom.getTeacher().getId(),
                teacherName,
                studentCount,
                classRoom.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public ClassRoomDto regenerateEnrollmentCode(Long teacherProfileId, Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "id", classId));

        if (!classRoom.getTeacher().getId().equals(teacherProfileId)) {
            throw new ForbiddenException("Access Denied: You cannot modify this classroom.");
        }

        String newCode = generateUniqueCode();
        classRoom.setEnrollmentCode(newCode);
        ClassRoom updated = classRoomRepository.save(classRoom);

        long studentCount = classEnrollmentRepository.countByClassRoomId(classId);
        String teacherName = updated.getTeacher().getUser().getFirstName() + " " + updated.getTeacher().getUser().getLastName();

        return new ClassRoomDto(
                updated.getId(),
                updated.getClassName(),
                updated.getSubject(),
                updated.getSection(),
                updated.getEnrollmentCode(),
                updated.getTeacher().getId(),
                teacherName,
                studentCount,
                updated.getCreatedAt()
        );
    }

    @Override
    @Transactional
    public ClassEnrollmentDto joinClass(Long studentProfileId, JoinClassRequest request) {
        String cleanCode = request.getEnrollmentCode().trim().toUpperCase();
        ClassRoom classRoom = classRoomRepository.findByEnrollmentCode(cleanCode)
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "enrollmentCode", cleanCode));

        StudentProfile student = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", studentProfileId));

        if (classEnrollmentRepository.existsByClassRoomIdAndStudentId(classRoom.getId(), studentProfileId)) {
            throw new DuplicateResourceException("You are already enrolled in class: " + classRoom.getClassName());
        }

        ClassEnrollment enrollment = new ClassEnrollment(classRoom, student);
        ClassEnrollment saved = classEnrollmentRepository.save(enrollment);

        String teacherName = classRoom.getTeacher().getUser().getFirstName() + " " + classRoom.getTeacher().getUser().getLastName();
        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();

        return new ClassEnrollmentDto(
                saved.getId(),
                classRoom.getId(),
                classRoom.getClassName(),
                classRoom.getSubject(),
                classRoom.getSection(),
                classRoom.getTeacher().getId(),
                teacherName,
                student.getId(),
                studentName,
                student.getStudentIdNumber(),
                saved.getEnrolledAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassEnrollmentDto> getStudentEnrolledClasses(Long studentProfileId) {
        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByStudentIdWithDetails(studentProfileId);
        return enrollments.stream().map(ce -> {
            ClassRoom cr = ce.getClassRoom();
            String teacherName = cr.getTeacher().getUser().getFirstName() + " " + cr.getTeacher().getUser().getLastName();
            String studentName = ce.getStudent().getUser().getFirstName() + " " + ce.getStudent().getUser().getLastName();
            return new ClassEnrollmentDto(
                    ce.getId(),
                    cr.getId(),
                    cr.getClassName(),
                    cr.getSubject(),
                    cr.getSection(),
                    cr.getTeacher().getId(),
                    teacherName,
                    ce.getStudent().getId(),
                    studentName,
                    ce.getStudent().getStudentIdNumber(),
                    ce.getEnrolledAt()
            );
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClassStudentDto> getClassStudents(Long teacherProfileId, Long classId, String query) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("ClassRoom", "id", classId));

        if (!classRoom.getTeacher().getId().equals(teacherProfileId)) {
            throw new ForbiddenException("Access Denied: You do not have access to this class roster.");
        }

        List<ClassEnrollment> enrollments = classEnrollmentRepository.findByClassRoomIdWithStudentDetails(classId);

        String trimmedQuery = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;

        return enrollments.stream()
                .filter(ce -> {
                    if (trimmedQuery == null) return true;
                    StudentProfile sp = ce.getStudent();
                    User u = sp.getUser();
                    String fullName = (u.getFirstName() + " " + u.getLastName()).toLowerCase();
                    String idNum = sp.getStudentIdNumber().toLowerCase();
                    return fullName.contains(trimmedQuery) || idNum.contains(trimmedQuery);
                })
                .map(ce -> {
                    StudentProfile profile = ce.getStudent();
                    User user = profile.getUser();
                    return new ClassStudentDto(
                            ce.getId(),
                            profile.getId(),
                            user.getId(),
                            profile.getStudentIdNumber(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getEmail(),
                            profile.getGradeLevel(),
                            profile.getTotalPoints(),
                            ce.getEnrolledAt()
                    );
                }).toList();
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("CLS-");
            for (int i = 0; i < CODE_LENGTH; i++) {
                int idx = random.nextInt(CODE_CHARS.length());
                sb.append(CODE_CHARS.charAt(idx));
            }
            String code = sb.toString();
            if (!classRoomRepository.existsByEnrollmentCode(code)) {
                return code;
            }
        }
        return "CLS-" + (System.currentTimeMillis() % 1000000);
    }
}
