package com.sms.repository;

import com.sms.model.entity.ClassEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassEnrollmentRepository extends JpaRepository<ClassEnrollment, Long> {

    boolean existsByClassRoomIdAndStudentId(Long classRoomId, Long studentId);

    Optional<ClassEnrollment> findByClassRoomIdAndStudentId(Long classRoomId, Long studentId);

    @Query("SELECT COUNT(ce) > 0 FROM ClassEnrollment ce WHERE ce.student.id = :studentId AND ce.classRoom.teacher.id = :teacherId")
    boolean isStudentEnrolledInTeacherClasses(@Param("studentId") Long studentId, @Param("teacherId") Long teacherId);

    @Query("SELECT ce FROM ClassEnrollment ce JOIN FETCH ce.classRoom cr JOIN FETCH cr.teacher t JOIN FETCH t.user WHERE ce.student.id = :studentId ORDER BY ce.enrolledAt DESC")
    List<ClassEnrollment> findByStudentIdWithDetails(@Param("studentId") Long studentId);

    @Query("SELECT ce FROM ClassEnrollment ce JOIN FETCH ce.student s JOIN FETCH s.user WHERE ce.classRoom.id = :classRoomId ORDER BY s.user.lastName ASC, s.user.firstName ASC")
    List<ClassEnrollment> findByClassRoomIdWithStudentDetails(@Param("classRoomId") Long classRoomId);

    long countByClassRoomId(Long classRoomId);
}
