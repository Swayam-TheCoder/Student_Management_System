package com.sms.repository;

import com.sms.model.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {

    @Query("SELECT cr FROM ClassRoom cr JOIN FETCH cr.teacher t JOIN FETCH t.user WHERE cr.teacher.id = :teacherId ORDER BY cr.createdAt DESC")
    List<ClassRoom> findByTeacherIdOrderByCreatedAtDesc(@Param("teacherId") Long teacherId);

    Optional<ClassRoom> findByEnrollmentCode(String enrollmentCode);

    boolean existsByEnrollmentCode(String enrollmentCode);

    long countByTeacherId(Long teacherId);
}
