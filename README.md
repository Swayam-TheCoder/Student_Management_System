# Student Management System

A production-quality full-stack academic merit, evaluation, and student management platform featuring a **Spring Boot 3.3.5** backend and an **Expo React Native** mobile client.

---

## Architecture Overview

- **Backend**: Java 23 / 17, Spring Boot 3.3.5, Spring Security 6, Spring Data JPA, Flyway, PostgreSQL 18, JJWT 0.12.6.
- **Mobile Frontend**: React Native, Expo SDK 51, TypeScript, React Navigation 6, Redux Toolkit, Context API (Theme), Expo SecureStore, Axios, React Hook Form, Zod.
- **Authentication**: Stateless HMAC-SHA256 Bearer JWT with hardware-backed SecureStore persistence.
- **Authorization**: Strict role-based access control (`STUDENT` vs `TEACHER`) with backend `@PreAuthorize` method guards.

---

## Mobile Features

1. **Role-Based Protected Navigation**:
   - `AuthNavigator`: Login & Register screens with password visibility toggle, Zod validation, and role toggle.
   - `StudentNavigator`: Bottom tabs for Dashboard, Leaderboard, Point History, Profile, and Settings.
   - `TeacherNavigator`: Bottom tabs for Dashboard, Student Directory, Award/Adjust Points, Leaderboard, Settings, and detailed Student Dossier.
2. **Point Management Engine**:
   - Teachers allocate merits or apply deductions across 5 categories (`ACADEMIC`, `PARTICIPATION`, `BEHAVIOR`, `PENALTY`, `ADJUSTMENT`).
   - Pessimistic write locking on the database prevents lost updates during concurrent allocations.
   - Real-time balance updates and immutable audit logging.
3. **Dynamic Competition Leaderboard**:
   - Server-side paginated standard competition ranking (`1, 2, 2, 4`).
   - Top 3 Podium highlight with medals and badges.
   - Highlights the authenticated student's relative position.
4. **Global Theming**:
   - Instant switching between Light Mode and Dark Mode via Context API.
   - Persistent theme preferences saved to SecureStore.

---

## Getting Started

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Compile and run tests
mvn clean test

# Start the Spring Boot server (port 8080)
mvn spring-boot:run
```

The backend connects to PostgreSQL running on `localhost:5433` (database: `sms_db`, user: `postgres`, password: `postgres`).

### 2. Frontend Mobile Setup

```powershell
# Navigate to frontend directory
cd frontend

# Verify TypeScript type checking
npx tsc --noEmit

# Start the Expo development server
npx expo start
```

Press `w` in the terminal to open in a web browser, or scan the QR code with the Expo Go app on a physical Android or iOS device connected to your local network.

---

## Network & Connectivity Configuration

- Mobile devices connect to the host computer's LAN IP (`10.46.187.163:8080`).
- Configured in `frontend/src/utils/env.ts`.
