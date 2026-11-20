package com.sms.repository;

import com.sms.model.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    Page<PointTransaction> findByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);
    Page<PointTransaction> findByTeacherIdOrderByCreatedAtDesc(Long teacherId, Pageable pageable);
}

