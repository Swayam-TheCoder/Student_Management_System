package com.sms.repository;

import com.sms.model.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    Page<PointTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<PointTransaction> findByTeacherIdOrderByCreatedAtDesc(Long teacherId, Pageable pageable);

    @Query(value = "SELECT pt FROM PointTransaction pt " +
                   "JOIN FETCH pt.student s " +
                   "JOIN FETCH s.user su " +
                   "JOIN FETCH pt.teacher t " +
                   "JOIN FETCH t.user tu " +
                   "WHERE s.id = :studentId",
           countQuery = "SELECT COUNT(pt) FROM PointTransaction pt WHERE pt.student.id = :studentId")
    Page<PointTransaction> findByStudentProfileIdWithDetails(@Param("studentId") Long studentId, Pageable pageable);
}
