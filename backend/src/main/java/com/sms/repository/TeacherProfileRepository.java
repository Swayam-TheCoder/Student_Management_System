package com.sms.repository;

import com.sms.model.entity.TeacherProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeacherProfileRepository extends JpaRepository<TeacherProfile, Long> {
    Optional<TeacherProfile> findByUserId(Long userId);
    Optional<TeacherProfile> findByEmployeeId(String employeeId);
    boolean existsByEmployeeId(String employeeId);
}

