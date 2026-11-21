package com.sms.service.impl;

import com.sms.common.exception.BadRequestException;
import com.sms.common.exception.ForbiddenException;
import com.sms.common.exception.ResourceNotFoundException;
import com.sms.common.response.PagedResponse;
import com.sms.dto.request.AwardPointsRequest;
import com.sms.dto.response.AwardPointsResponse;
import com.sms.dto.response.PointTransactionDto;
import com.sms.model.entity.PointTransaction;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.TeacherProfile;
import com.sms.model.enums.Role;
import com.sms.model.enums.TransactionType;
import com.sms.repository.ClassEnrollmentRepository;
import com.sms.repository.PointTransactionRepository;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.TeacherProfileRepository;
import com.sms.security.UserPrincipal;
import com.sms.service.PointService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class PointServiceImpl implements PointService {

    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PointTransactionRepository pointTransactionRepository;
    private final ClassEnrollmentRepository classEnrollmentRepository;

    public PointServiceImpl(StudentProfileRepository studentProfileRepository,
                            TeacherProfileRepository teacherProfileRepository,
                            PointTransactionRepository pointTransactionRepository,
                            ClassEnrollmentRepository classEnrollmentRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.teacherProfileRepository = teacherProfileRepository;
        this.pointTransactionRepository = pointTransactionRepository;
        this.classEnrollmentRepository = classEnrollmentRepository;
    }

    @Override
    @Transactional
    public AwardPointsResponse awardPoints(Long teacherProfileId, AwardPointsRequest request) {
        if (request.getPoints() == null || request.getPoints() == 0) {
            throw new BadRequestException("Points delta cannot be zero");
        }

        TeacherProfile teacher = teacherProfileRepository.findById(teacherProfileId)
                .orElseThrow(() -> new ResourceNotFoundException("TeacherProfile", "id", teacherProfileId));

        // Use pessimistic lock to prevent concurrent update races on the student's score
        StudentProfile student = studentProfileRepository.findByIdWithLock(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", request.getStudentId()));

        // STRICT AUTHORIZATION: Enforce that the student is enrolled in at least one class of the teacher
        boolean isEnrolled = classEnrollmentRepository.isStudentEnrolledInTeacherClasses(student.getId(), teacherProfileId);
        if (!isEnrolled) {
            throw new ForbiddenException(String.format(
                    "Access Denied: Student '%s %s' is not enrolled in any of your classes. Teachers can only award or adjust points for enrolled students.",
                    student.getUser().getFirstName(), student.getUser().getLastName()
            ));
        }

        int pointsDelta = request.getPoints();
        if (request.getTransactionType() == TransactionType.PENALTY && pointsDelta > 0) {
            pointsDelta = -pointsDelta;
        }

        int newTotal = student.getTotalPoints() + pointsDelta;
        if (newTotal < 0) {
            throw new BadRequestException(String.format(
                    "Insufficient points: cannot deduct %d points from student '%s' who currently has %d points",
                    Math.abs(pointsDelta), student.getStudentIdNumber(), student.getTotalPoints()
            ));
        }

        // Record immutable transaction history
        PointTransaction transaction = new PointTransaction(
                student,
                teacher,
                pointsDelta,
                request.getTransactionType(),
                request.getReason().trim()
        );
        PointTransaction savedTransaction = pointTransactionRepository.save(transaction);

        // Update student total points atomically
        student.setTotalPoints(newTotal);
        StudentProfile updatedStudent = studentProfileRepository.save(student);

        PointTransactionDto transactionDto = mapToTransactionDto(savedTransaction);
        String studentFullName = student.getUser().getFirstName() + " " + student.getUser().getLastName();

        return new AwardPointsResponse(
                updatedStudent.getId(),
                studentFullName,
                updatedStudent.getTotalPoints(),
                transactionDto
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PointTransactionDto> getStudentTransactions(Long studentProfileId, Pageable pageable) {
        if (!studentProfileRepository.existsById(studentProfileId)) {
            throw new ResourceNotFoundException("StudentProfile", "id", studentProfileId);
        }

        Page<PointTransaction> txPage = pointTransactionRepository.findByStudentProfileIdWithDetails(studentProfileId, pageable);
        List<PointTransactionDto> dtoList = txPage.getContent().stream()
                .map(this::mapToTransactionDto)
                .toList();

        return new PagedResponse<>(
                dtoList,
                txPage.getNumber(),
                txPage.getSize(),
                txPage.getTotalElements(),
                txPage.getTotalPages(),
                txPage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PointTransactionDto> getStudentTransactionsForPrincipal(Long studentProfileId, UserPrincipal principal, Pageable pageable) {
        if (principal.getRole() == Role.TEACHER) {
            boolean isEnrolled = classEnrollmentRepository.isStudentEnrolledInTeacherClasses(studentProfileId, principal.getProfileId());
            if (!isEnrolled) {
                throw new ForbiddenException("Access Denied: You can only view transaction history for students enrolled in your classes.");
            }
        } else if (principal.getRole() == Role.STUDENT) {
            if (!studentProfileId.equals(principal.getProfileId())) {
                throw new ForbiddenException("Access Denied: You cannot view transaction history for other students.");
            }
        }
        return getStudentTransactions(studentProfileId, pageable);
    }

    @Override
    public List<TransactionType> getTransactionTypes() {
        return Arrays.asList(TransactionType.values());
    }

    private PointTransactionDto mapToTransactionDto(PointTransaction tx) {
        String studentName = tx.getStudent().getUser().getFirstName() + " " + tx.getStudent().getUser().getLastName();
        String teacherName = tx.getTeacher().getUser().getFirstName() + " " + tx.getTeacher().getUser().getLastName();

        return new PointTransactionDto(
                tx.getId(),
                tx.getStudent().getId(),
                studentName,
                tx.getStudent().getStudentIdNumber(),
                tx.getTeacher().getId(),
                teacherName,
                tx.getPoints(),
                tx.getTransactionType(),
                tx.getReason(),
                tx.getCreatedAt()
        );
    }
}
