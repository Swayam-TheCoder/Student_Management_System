package com.sms.model.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "class_enrollments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_class_student", columnNames = {"class_id", "student_id"})
    }
)
public class ClassEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private Instant enrolledAt;

    public ClassEnrollment() {
    }

    public ClassEnrollment(ClassRoom classRoom, StudentProfile student) {
        this.classRoom = classRoom;
        this.student = student;
    }

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ClassRoom getClassRoom() {
        return classRoom;
    }

    public void setClassRoom(ClassRoom classRoom) {
        this.classRoom = classRoom;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public Instant getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(Instant enrolledAt) {
        this.enrolledAt = enrolledAt;
    }
}
