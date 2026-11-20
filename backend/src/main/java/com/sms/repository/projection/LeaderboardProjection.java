package com.sms.repository.projection;

public interface LeaderboardProjection {
    Long getStudentId();
    String getStudentIdNumber();
    String getStudentName();
    String getGradeLevel();
    Integer getTotalPoints();
    Long getRank();
}

