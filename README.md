# Student Management System

A production-grade Student Management System backend engineered with Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, Flyway migrations, and PostgreSQL.

## Core Features Implemented

1. **Role-Based Authentication & Authorization**
   - JWT authentication signed via HMAC-SHA256 with stateless session management.
   - Distinct roles: `STUDENT` and `TEACHER`.
   - Teacher registration guarded by an invitation secret.
   - BCrypt hashing (12 rounds) with zero password exposure in DTO responses.

2. **Student Directory & Profile Management**
   - Teacher student search with pagination and sorting.
   - Protected profile retrieval: students access only their own profile; teachers can access any student.

3. **Point Management Engine**
   - Teachers award or deduct points across categories: `ACADEMIC`, `PARTICIPATION`, `BEHAVIOR`, `PENALTY`, `ADJUSTMENT`.
   - Immutable audit logging for every point transaction.
   - Atomic balance updates using pessimistic database write locking to prevent lost updates under concurrent awards.
   - Non-negative point validation preventing balances below zero.

4. **Dynamic Competition Leaderboard**
   - Global standard competition ranking (`1, 2, 2, 4`) calculated via SQL window functions.
   - Accurate ranking preserved across server-side pagination slices.

---

## API Specifications

### Authentication
- `POST /api/v1/auth/register` — Register student or teacher.
- `POST /api/v1/auth/login` — Authenticate and receive JWT token.
- `GET /api/v1/auth/me` — Retrieve current authenticated user profile.

### Student Management
- `GET /api/v1/students` — Paginated student search (Teacher only).
- `GET /api/v1/students/{id}` — Student profile by ID (Teacher or own student).
- `GET /api/v1/students/me/profile` — Logged-in student's profile (Student only).
- `GET /api/v1/students/{id}/transactions` — Paginated point history (Teacher or own student).

### Point Adjustments
- `POST /api/v1/points/award` — Award or adjust points (Teacher only).
- `GET /api/v1/points/types` — List valid transaction types.

### Leaderboard
- `GET /api/v1/leaderboard` — Paginated global leaderboard with competition rank.

---

## Running the Application

### Prerequisites
- Java 17 or higher
- Apache Maven 3.9+
- PostgreSQL database

### Local Startup
```powershell
# Navigate to backend
cd backend

# Execute via Maven
mvn spring-boot:run
```

### Running Test Suite
```powershell
cd backend
mvn test
```

