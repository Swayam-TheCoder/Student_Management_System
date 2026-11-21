-- Class and Enrollment Schema for Student Management System
-- Version: V2

CREATE TABLE class_rooms (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL REFERENCES teacher_profiles(id) ON DELETE RESTRICT,
    class_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL,
    enrollment_code VARCHAR(16) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_enrollments (
    id BIGSERIAL PRIMARY KEY,
    class_id BIGINT NOT NULL REFERENCES class_rooms(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_student UNIQUE (class_id, student_id)
);

CREATE INDEX idx_classes_teacher_id ON class_rooms(teacher_id);
CREATE INDEX idx_classes_enrollment_code ON class_rooms(enrollment_code);
CREATE INDEX idx_enrollments_student_id ON class_enrollments(student_id);
CREATE INDEX idx_enrollments_class_id ON class_enrollments(class_id);
