package com.sms.repository;

import com.sms.model.entity.StudentProfile;
import com.sms.repository.projection.LeaderboardProjection;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByUserId(Long userId);

    Optional<StudentProfile> findByStudentIdNumber(String studentIdNumber);

    boolean existsByStudentIdNumber(String studentIdNumber);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM StudentProfile s WHERE s.id = :id")
    Optional<StudentProfile> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT s FROM StudentProfile s JOIN FETCH s.user u WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.studentIdNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<StudentProfile> searchStudents(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT sp FROM StudentProfile sp JOIN FETCH sp.user u WHERE " +
           "sp.id IN (SELECT ce.student.id FROM ClassEnrollment ce WHERE ce.classRoom.teacher.id = :teacherId) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.studentIdNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')))",
           countQuery = "SELECT COUNT(sp) FROM StudentProfile sp WHERE " +
           "sp.id IN (SELECT ce.student.id FROM ClassEnrollment ce WHERE ce.classRoom.teacher.id = :teacherId) AND " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(sp.user.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.user.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.studentIdNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sp.user.email) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<StudentProfile> findTeacherEnrolledStudents(@Param("teacherId") Long teacherId, @Param("query") String query, Pageable pageable);

    @Query(value = "SELECT sp.id AS studentId, " +
                   "sp.student_id_number AS studentIdNumber, " +
                   "CONCAT(u.first_name, ' ', u.last_name) AS studentName, " +
                   "sp.grade_level AS gradeLevel, " +
                   "sp.total_points AS totalPoints, " +
                   "RANK() OVER (ORDER BY sp.total_points DESC) AS rank " +
                   "FROM student_profiles sp " +
                   "JOIN users u ON sp.user_id = u.id " +
                   "WHERE u.is_active = true " +
                   "ORDER BY sp.total_points DESC, sp.id ASC",
           countQuery = "SELECT COUNT(*) FROM student_profiles sp JOIN users u ON sp.user_id = u.id WHERE u.is_active = true",
           nativeQuery = true)
    Page<LeaderboardProjection> getLeaderboard(Pageable pageable);
}
