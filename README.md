# Student Management System (SMS)

A full-stack academic merit, evaluation, and student management platform featuring a **Spring Boot 3.3.5** backend, **PostgreSQL 18** relational persistence, and an **Expo React Native** cross-platform mobile client with **TypeScript** and **Redux Toolkit**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Folder Structure](#4-folder-structure)
5. [PostgreSQL Database Setup](#5-postgresql-database-setup)
6. [Environment Variables](#6-environment-variables)
7. [Backend Execution Instructions](#7-backend-execution-instructions)
8. [Frontend Execution Instructions](#8-frontend-execution-instructions)
9. [API Endpoint Documentation](#9-api-endpoint-documentation)
10. [Student & Teacher Demo Walkthrough](#10-student--teacher-demo-walkthrough)
11. [Physical Android Device Network Configuration](#11-physical-android-device-network-configuration)
12. [Troubleshooting Guide](#12-troubleshooting-guide)

---

## 1. Project Overview

The **Student Management System** is built to manage student performance, recognize academic and extracurricular merits, and motivate student engagement through dynamic gamified rankings.

### Core Capabilities:
- **Role-Based Authentication**: Secure JWT-based registration and authentication for two distinct roles: `STUDENT` and `TEACHER`.
- **Protected Mobile Navigation**: Automatic navigation branching based on role and authentication state.
- **Pessimistic Concurrency Control**: Database-level write locking on student point balance records prevents race conditions and lost updates during simultaneous point allocations by faculty.
- **Auditable Point Transactions**: Every point award, penalty deduction, or clerical adjustment creates an immutable transaction record attributed to the granting teacher.
- **Dynamic Leaderboard**: Real-time SQL standard competition ranking (`RANK() OVER (ORDER BY total_points DESC)`) with tied rank preservation and top-3 podium rendering.
- **Theme Support**: Real-time light and dark mode toggle persisted across app restarts via `Expo SecureStore` / `localStorage`.

---

## 2. Technology Stack

### Backend
- **Java**: Version 17+ (tested with Java 23)
- **Framework**: Spring Boot 3.3.5
- **Security**: Spring Security 6 with stateless Bearer JWT (JJWT 0.12.6)
- **Data Persistence**: Spring Data JPA & Hibernate 6.5
- **Database Migrations**: Flyway 10.x
- **Database Engine**: PostgreSQL 18
- **Build Tool**: Apache Maven 3.9+
- **Validation**: Hibernate Validator (Bean Validation API / JSR-380)

### Frontend (Mobile & Web)
- **Framework**: React Native 0.74 with Expo SDK 51
- **Language**: TypeScript 5.3+
- **State Management**: Redux Toolkit (RTK) & React-Redux
- **Routing & Navigation**: React Navigation 6 (Native Stack & Bottom Tabs)
- **Theming**: React Context API with persistent token-based design tokens
- **Persistence**: Expo SecureStore (Hardware-backed encrypted storage on mobile; fallback `localStorage` on Web)
- **HTTP Client**: Axios with dynamic IP resolution and request/response interceptors
- **Forms & Validation**: React Hook Form with Zod schema resolution
- **Vector Icons**: Expo Vector Icons (`@expo/vector-icons` Ionicons)

---

## 3. System Architecture

```
                    +------------------------------------+
                    |        Expo React Native App       |
                    |  (Web / iOS / Android Emulator)    |
                    +-----------------+------------------+
                                      | HTTP / REST (JWT)
                                      v
                    +------------------------------------+
                    |       Spring Security Filter       |
                    | (JwtAuthenticationFilter + CORS)   |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |         Controller Layer           |
                    |  AuthController | StudentController|
                    |  PointController| LeaderboardCtrl  |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |          Service Layer             |
                    |  AuthService    | StudentService   |
                    |  PointService   | LeaderboardServ  |
                    +-----------------+------------------+
                                      |
                                      v
                    +------------------------------------+
                    |         Repository Layer           |
                    |   Spring Data JPA (Pessimistic)    |
                    +-----------------+------------------+
                                      | JDBC
                                      v
                    +------------------------------------+
                    |      PostgreSQL 18 Database        |
                    | (users, student_profiles,          |
                    |  teacher_profiles, point_trans)    |
                    +------------------------------------+
```

### Key Architectural Patterns:
1. **Controller-Service-Repository**: Separation of concerns. Controllers map requests and return standardized `ApiResponse<T>` / `PagedResponse<T>` envelopes. Services encapsulate transactional business logic. Repositories handle database interactions.
2. **DTO Layer**: Entity isolation ensures database entities are never leaked over REST boundaries.
3. **Pessimistic Write Locking**: `@Lock(LockModeType.PESSIMISTIC_WRITE)` on `StudentProfile` ensures transaction isolation during point balance updates.
4. **Centralized Exception Handling**: `@RestControllerAdvice` translates entity, validation, and authorization errors into consistent JSON error envelopes with proper HTTP status codes (400, 401, 403, 404, 409, 500).

---

## 4. Folder Structure

```
StudentManagementSystem/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sms/
│   │   │   │   ├── common/
│   │   │   │   │   ├── exception/      # GlobalExceptionHandler & custom exceptions
│   │   │   │   │   └── response/       # ApiResponse & PagedResponse envelopes
│   │   │   │   ├── config/             # SecurityConfig, CorsConfig
│   │   │   │   ├── controller/         # REST Controllers (Auth, Student, Point, Leaderboard)
│   │   │   │   ├── dto/                # Request & Response DTOs
│   │   │   │   ├── model/
│   │   │   │   │   ├── entity/         # User, StudentProfile, TeacherProfile, PointTransaction
│   │   │   │   │   └── enums/          # Role (STUDENT, TEACHER), TransactionType
│   │   │   │   ├── repository/         # Spring Data JPA Repositories & Projections
│   │   │   │   ├── security/           # JwtTokenProvider, UserPrincipal, Filters
│   │   │   │   └── service/            # Service Interfaces & Implementations
│   │   │   └── resources/
│   │   │       ├── db/migration/       # V1__initial_schema.sql (Flyway)
│   │   │       ├── application.yml     # Production & default database properties
│   │   │       └── application-test.yml# In-memory H2 test properties
│   │   └── test/java/com/sms/          # Integration & unit test suites
│   ├── .env.example                    # Backend environment template
│   └── pom.xml                         # Maven dependencies and build definition
│
├── frontend/
│   ├── assets/                         # App icons, splash screens, assets
│   ├── src/
│   │   ├── api/                        # Axios HTTP clients & API modules
│   │   ├── components/
│   │   │   ├── common/                 # Button, Input, Card, Badge, EmptyState
│   │   │   ├── layout/                 # ScreenContainer (responsive desktop/mobile wrapper)
│   │   │   ├── leaderboard/            # PodiumCard, LeaderboardRow
│   │   │   └── points/                 # TransactionItem
│   │   ├── context/                    # ThemeContext (Light/Dark mode)
│   │   ├── features/
│   │   │   ├── auth/                   # LoginScreen, RegisterScreen, SplashScreen
│   │   │   ├── student/                # StudentDashboard, Profile, PointHistory
│   │   │   ├── teacher/                # TeacherDashboard, StudentDirectory, AwardPoints, Dossier
│   │   │   ├── leaderboard/            # LeaderboardScreen
│   │   │   └── settings/               # SettingsScreen (Theme, API URL config)
│   │   ├── navigation/                 # Root, Auth, Student, Teacher navigators
│   │   ├── store/                      # Redux Toolkit store, authSlice, leaderboardSlice
│   │   ├── theme/                      # Colors, typography, spacing, layout constraints
│   │   ├── types/                      # TypeScript declarations for API, Auth, Nav
│   │   └── utils/                      # Env config, date/point formatters, SecureStore
│   ├── .env.example                    # Frontend environment template
│   ├── app.json                        # Expo app manifest
│   ├── package.json                    # Node dependencies
│   └── tsconfig.json                   # TypeScript configuration
│
├── run_qa_tests.ps1                    # Automated End-to-End QA Test Suite
└── README.md                           # Master Project Documentation
```

---

## 5. PostgreSQL Database Setup

### Step 1: Install & Verify PostgreSQL
Ensure PostgreSQL is running locally on port `5432`:
```powershell
Get-Service -Name *postgres*
```

### Step 2: Create the Database
Open PostgreSQL CLI (`psql`) or pgAdmin and run:
```sql
CREATE DATABASE sms_db;
```

### Step 3: Automated Migrations with Flyway
Database tables are automatically created on startup using Flyway migration script `V1__initial_schema.sql`:
- `users`: Core authentication identity table (email, password hash, role, timestamps).
- `student_profiles`: One-to-one with user, holds unique student ID number, grade level, total points.
- `teacher_profiles`: One-to-one with user, holds unique employee ID and department.
- `point_transactions`: Immutable log of every point allocation, penalty, or adjustment with student and teacher foreign keys.

---

## 6. Environment Variables

### Backend Configuration (`backend/.env.example`)
Copy `.env.example` to `.env` or pass variables through your deployment environment:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `SERVER_PORT` | `8080` | Port for Spring Boot HTTP server |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/sms_db` | JDBC URL for PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `swayam12` | Database password |
| `SPRING_JPA_SHOW_SQL` | `false` | Enable SQL statement logging |
| `JWT_SECRET` | *(256-bit base64 key)* | HMAC-SHA256 signature key |
| `JWT_EXPIRATION_MS` | `86400000` | Token expiration in ms (24 hours) |
| `TEACHER_INVITATION_CODE` | `TEACHER_SECRET_2026` | Verification key required for teacher registration |

### Frontend Configuration (`frontend/.env.example`)
Copy `.env.example` to `.env` in the `frontend/` folder:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | Explicit backend API base URL |
| `EXPO_PUBLIC_LAN_IP` | `10.46.187.163` | Local Network IP for physical mobile testing |

---

## 7. Backend Execution Instructions

### Run Automated Unit & Integration Tests:
```powershell
cd backend
mvn clean test
```

### Build Executable Production JAR:
```powershell
mvn clean package
```

### Start Backend Application:
You can run via Maven or directly run the packaged JAR:
```powershell
# Option A: Run JAR directly (fastest)
java -jar target/student-management-system-1.0.0.jar

# Option B: Run with Maven
mvn spring-boot:run
```

Verify backend health by visiting:
```
http://localhost:8080/api/v1/health
```

---

## 8. Frontend Execution Instructions

### Step 1: Install Dependencies
```powershell
cd frontend
npm install
```

### Step 2: Verify TypeScript Compilation
```powershell
npx tsc --noEmit
```

### Step 3: Start Expo Development Server
```powershell
npx expo start
```

### Platform Launch Shortcuts:
- Press **`w`** in the terminal to launch in your default web browser (`http://localhost:8081`).
- Press **`a`** to open in an attached Android Emulator.
- Press **`i`** to open in an iOS Simulator (macOS only).
- Scan the QR code using the **Expo Go** application on your physical iOS or Android device.

---

## 9. API Endpoint Documentation

All endpoints are prefixed with `/api/v1`.

### Authentication Endpoints (`/auth`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new Student or Teacher account |
| `POST` | `/auth/login` | Public | Authenticate credentials and receive JWT |
| `GET` | `/auth/me` | Authenticated | Retrieve currently authenticated user & profile |

### Student Management Endpoints (`/students`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/students` | `TEACHER` only | Paginated search of all student profiles |
| `GET` | `/students/{id}` | `TEACHER` or Profile Owner | Retrieve student dossier details by student ID |
| `GET` | `/students/me/profile` | `STUDENT` only | Retrieve the authenticated student's profile |
| `GET` | `/students/{id}/transactions` | `TEACHER` or Profile Owner | Retrieve paginated point transaction history |

### Point Management Endpoints (`/points`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/points/award` | `TEACHER` only | Allocate, deduct, or adjust points for a student |
| `GET` | `/points/types` | Authenticated | List valid transaction types (`ACADEMIC`, `PARTICIPATION`, `BEHAVIOR`, `PENALTY`, `ADJUSTMENT`) |

### Leaderboard Endpoints (`/leaderboard`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/leaderboard` | Authenticated | Paginated standard competition leaderboard ranking |

### System Health Endpoint (`/health`)
| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Verify service status and database connectivity |

---

## 10. Student & Teacher Demo Walkthrough

### Scenario A: Faculty Point Allocation & Class Audit
1. Open the application and navigate to the **Create Account** screen.
2. Select the **Teacher** tab.
3. Fill in the registration form:
   - **First / Last Name**: `Sarah Connor`
   - **Email**: `sarah.connor@school.edu`
   - **Password**: `TeacherPass123!`
   - **Employee ID**: `FAC-2026-901`
   - **Department**: `Computer Science`
   - **Teacher Secret**: `TEACHER_SECRET_2026`
4. Tap **Create Account**. You will land on the **Faculty Dashboard**.
5. Tap **Student Directory** to view active students.
6. Select any student (e.g. `STU-2026-001`).
7. Tap **Award / Adjust Points**.
8. Select Category: **Academic Excellence**, choose `+50` points, enter reason: *"Exceptional project presentation"*, and confirm.
9. Verify the student's updated total immediately reflects the new score.

### Scenario B: Student Profile, History & Leaderboard
1. Log out from the Settings tab.
2. Sign in as a student (or register a new student account).
3. The **Student Dashboard** displays:
   - Current total verified merits.
   - Dynamic competition rank badge (e.g. `#1`).
   - Recent transaction audit item.
4. Tap **Point History** to review all past merits and penalty transactions with faculty attribution.
5. Tap **Ranks / Leaderboard** to see the podium stand and competition standings.
6. Navigate to **Settings** and toggle **Dark Mode** to preview seamless dynamic theme switching.

---

## 11. Physical Android Device Network Configuration

When running Expo on a physical smartphone:
1. Connect your smartphone to the **same Wi-Fi network** as your computer.
2. Find your computer's local IP address:
   ```powershell
   ipconfig
   # Look for IPv4 Address under Wireless LAN adapter Wi-Fi (e.g. 192.168.1.100)
   ```
3. Update `frontend/.env`:
   ```properties
   EXPO_PUBLIC_LAN_IP=192.168.1.100
   ```
4. Or configure the host directly inside the app:
   - In the running app, open the **Settings** tab.
   - Under **Backend Server URL**, tap **Edit URL**.
   - Enter `http://192.168.1.100:8080/api/v1` and tap **Save & Test**.
5. Ensure Windows Firewall permits incoming connections on port `8080`:
   ```powershell
   netsh advfirewall firewall add rule name="Spring Boot Port 8080" dir=in action=allow protocol=TCP localport=8080
   ```

---

## 12. Troubleshooting Guide

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`Connection refused` on Mobile** | Mobile device cannot connect to `localhost`. | Set your computer's LAN IP (`http://192.168.x.x:8080/api/v1`) in `frontend/.env` or in the in-app Settings screen. |
| **PostgreSQL Connection Error** | PostgreSQL service stopped or credentials mismatch. | Verify PostgreSQL service is running (`Get-Service *postgres*`) and check password in `backend/src/main/resources/application.yml`. |
| **Teacher Registration Fails with 400** | Missing or incorrect teacher secret code. | Ensure `invitationCode` matches `TEACHER_SECRET_2026`. |
| **403 Forbidden on Student Directory** | User is authenticated with `ROLE_STUDENT`. | Only faculty members (`ROLE_TEACHER`) can browse the entire student directory. |
| **Metro Bundler Cache Issues** | Stale assets or bundle cache. | Restart Metro with cache cleared: `npx expo start -c`. |
| **Port 8080 in use** | Another instance of Java or server is running. | Find the process (`Get-NetTCPConnection -LocalPort 8080`) and terminate it (`Stop-Process -Id <PID>`). |
