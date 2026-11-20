package com.sms.service;

import com.sms.common.exception.BadRequestException;
import com.sms.common.response.PagedResponse;
import com.sms.dto.request.AwardPointsRequest;
import com.sms.dto.response.AwardPointsResponse;
import com.sms.dto.response.LeaderboardEntryDto;
import com.sms.dto.response.PointTransactionDto;
import com.sms.dto.response.StudentDetailDto;
import com.sms.model.entity.StudentProfile;
import com.sms.model.entity.TeacherProfile;
import com.sms.model.entity.User;
import com.sms.model.enums.Role;
import com.sms.model.enums.TransactionType;
import com.sms.repository.PointTransactionRepository;
import com.sms.repository.StudentProfileRepository;
import com.sms.repository.TeacherProfileRepository;
import com.sms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class StudentManagementIntegrationTest {

    @Autowired
    private StudentService studentService;

    @Autowired
    private PointService pointService;

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private TeacherProfileRepository teacherProfileRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private TeacherProfile testTeacher;
    private StudentProfile studentA;
    private StudentProfile studentB;
    private StudentProfile studentC;
    private StudentProfile studentD;

    @BeforeEach
    void setUp() {
        pointTransactionRepository.deleteAll();
        studentProfileRepository.deleteAll();
        teacherProfileRepository.deleteAll();
        userRepository.deleteAll();

        // Create a teacher
        User teacherUser = new User("teacher.doe@sms.com", passwordEncoder.encode("Secret123!"), "Jane", "Doe", Role.TEACHER);
        userRepository.save(teacherUser);
        testTeacher = teacherProfileRepository.save(new TeacherProfile(teacherUser, "EMP-9001", "Computer Science"));

        // Create 4 students for ranking & point tests
        studentA = createTestStudent("rahul.verma@sms.com", "Rahul", "Verma", "STU-101", "Grade 11", 950);
        studentB = createTestStudent("priya.nair@sms.com", "Priya", "Nair", "STU-102", "Grade 11", 900);
        studentC = createTestStudent("amit.patel@sms.com", "Amit", "Patel", "STU-103", "Grade 11", 900);
        studentD = createTestStudent("karan.singh@sms.com", "Karan", "Singh", "STU-104", "Grade 11", 800);
    }

    private StudentProfile createTestStudent(String email, String first, String last, String studentIdNum, String grade, int points) {
        User u = new User(email, passwordEncoder.encode("Password123!"), first, last, Role.STUDENT);
        userRepository.save(u);
        StudentProfile sp = new StudentProfile(u, studentIdNum, grade);
        sp.setTotalPoints(points);
        return studentProfileRepository.save(sp);
    }

    @Test
    @DisplayName("Teacher can list and search students with pagination")
    void testSearchAndListStudents() {
        // Search by first name
        PagedResponse<StudentDetailDto> searchByName = studentService.getAllStudents(
                "Rahul", PageRequest.of(0, 10, Sort.by("id").ascending())
        );
        assertEquals(1, searchByName.getContent().size());
        assertEquals("Rahul", searchByName.getContent().get(0).getFirstName());

        // Search by student ID number
        PagedResponse<StudentDetailDto> searchByIdNum = studentService.getAllStudents(
                "STU-102", PageRequest.of(0, 10, Sort.by("id").ascending())
        );
        assertEquals(1, searchByIdNum.getContent().size());
        assertEquals("Priya", searchByIdNum.getContent().get(0).getFirstName());

        // List all students paginated (page size = 2)
        PagedResponse<StudentDetailDto> page0 = studentService.getAllStudents(
                null, PageRequest.of(0, 2, Sort.by("id").ascending())
        );
        assertEquals(2, page0.getContent().size());
        assertEquals(4, page0.getTotalElements());
        assertEquals(2, page0.getTotalPages());
        assertTrue(page0.isHasNext());
    }

    @Test
    @DisplayName("Teacher can award points to a student and update balance inside transaction")
    void testAwardPoints() {
        AwardPointsRequest req = new AwardPointsRequest(
                studentA.getId(),
                50,
                TransactionType.ACADEMIC,
                "Outstanding mid-term project performance"
        );

        AwardPointsResponse res = pointService.awardPoints(testTeacher.getId(), req);

        assertEquals(1000, res.getUpdatedTotalPoints());
        assertEquals("Rahul Verma", res.getStudentName());
        assertNotNull(res.getTransaction());
        assertEquals(50, res.getTransaction().getPoints());
        assertEquals(TransactionType.ACADEMIC, res.getTransaction().getTransactionType());

        // Check DB persisted points
        StudentProfile refreshed = studentProfileRepository.findById(studentA.getId()).orElseThrow();
        assertEquals(1000, refreshed.getTotalPoints());

        // Verify transaction log
        PagedResponse<PointTransactionDto> txs = pointService.getStudentTransactions(
                studentA.getId(), PageRequest.of(0, 10)
        );
        assertEquals(1, txs.getContent().size());
        assertEquals("Outstanding mid-term project performance", txs.getContent().get(0).getReason());
    }

    @Test
    @DisplayName("Teacher can apply point deductions and penalties")
    void testPointDeductionAndPenalty() {
        // Apply penalty of 100 points
        AwardPointsRequest req = new AwardPointsRequest(
                studentD.getId(),
                100, // Even if passed positive, PENALTY adjusts negative
                TransactionType.PENALTY,
                "Unexcused assignment absence"
        );

        AwardPointsResponse res = pointService.awardPoints(testTeacher.getId(), req);
        assertEquals(700, res.getUpdatedTotalPoints()); // 800 - 100 = 700

        // Attempt excessive deduction exceeding balance (700 - 800 < 0)
        AwardPointsRequest excessiveReq = new AwardPointsRequest(
                studentD.getId(),
                -800,
                TransactionType.ADJUSTMENT,
                "Invalid manual deduction"
        );

        assertThrows(BadRequestException.class, () ->
                pointService.awardPoints(testTeacher.getId(), excessiveReq)
        );
    }

    @Test
    @DisplayName("Leaderboard computes standard competition ranking (1224 ranking) across pages")
    void testDynamicLeaderboardCompetitionRanking() {
        // Page 0 (size = 4): All students
        PagedResponse<LeaderboardEntryDto> lb = leaderboardService.getLeaderboard(0, 4);

        assertEquals(4, lb.getContent().size());

        // Verify standard competition ranks: Rahul (950) -> 1, Priya (900) -> 2, Amit (900) -> 2, Karan (800) -> 4
        LeaderboardEntryDto rank1 = lb.getContent().get(0);
        assertEquals(1L, rank1.getRank());
        assertEquals(950, rank1.getTotalPoints());
        assertEquals("Rahul Verma", rank1.getStudentName());

        LeaderboardEntryDto rank2a = lb.getContent().get(1);
        assertEquals(2L, rank2a.getRank());
        assertEquals(900, rank2a.getTotalPoints());

        LeaderboardEntryDto rank2b = lb.getContent().get(2);
        assertEquals(2L, rank2b.getRank());
        assertEquals(900, rank2b.getTotalPoints());

        LeaderboardEntryDto rank4 = lb.getContent().get(3);
        assertEquals(4L, rank4.getRank()); // Skips to 4 due to tied rank 2
        assertEquals(800, rank4.getTotalPoints());
        assertEquals("Karan Singh", rank4.getStudentName());

        // Test pagination consistency: Page 1 (size = 2) should contain Amit (rank 2) and Karan (rank 4)
        PagedResponse<LeaderboardEntryDto> lbPage1 = leaderboardService.getLeaderboard(1, 2);
        assertEquals(2, lbPage1.getContent().size());
        assertEquals(2L, lbPage1.getContent().get(0).getRank());
        assertEquals(4L, lbPage1.getContent().get(1).getRank());
    }

    @Test
    @DisplayName("Concurrent point awards use pessimistic locking to prevent lost updates")
    void testConcurrentPointAwards() throws InterruptedException, ExecutionException {
        int threadCount = 10;
        int pointsPerThread = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);

        List<Future<AwardPointsResponse>> futures = new ArrayList<>();

        for (int i = 0; i < threadCount; i++) {
            final int index = i;
            futures.add(executorService.submit(() -> {
                readyLatch.countDown();
                startLatch.await(); // Guarantee simultaneous release
                AwardPointsRequest request = new AwardPointsRequest(
                        studentA.getId(),
                        pointsPerThread,
                        TransactionType.PARTICIPATION,
                        "Concurrent batch point " + index
                );
                return pointService.awardPoints(testTeacher.getId(), request);
            }));
        }

        readyLatch.await();
        startLatch.countDown(); // Fire all threads at once

        for (Future<AwardPointsResponse> f : futures) {
            f.get();
        }

        executorService.shutdown();
        assertTrue(executorService.awaitTermination(10, TimeUnit.SECONDS));

        // Initial points was 950. 10 threads * 10 points = +100 points. Expected exactly 1050!
        StudentProfile finalStudent = studentProfileRepository.findById(studentA.getId()).orElseThrow();
        assertEquals(950 + (threadCount * pointsPerThread), finalStudent.getTotalPoints());
    }
}

