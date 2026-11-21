<#
.SYNOPSIS
    Automated End-to-End QA Integration Test Suite for Student Management System
.DESCRIPTION
    Validates complete system behavior against the running Spring Boot backend & PostgreSQL database:
    1. System health and DB connectivity
    2. Role-based user registration (Student & Teacher)
    3. Authentication & JWT token generation
    4. Credential security (invalid password rejection)
    5. Session restoration (/api/v1/auth/me)
    6. Role-based access control & authorization guards (401 & 403 checks)
    7. Point management flows (awards, penalties, adjustments)
    8. Database validation & negative balance rejection
    9. Dynamic leaderboard ordering, tied-rank handling, and live re-ordering
#>

param(
    [string]$BaseUrl = "http://localhost:8080/api/v1"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " STUDENT MANAGEMENT SYSTEM - AUTOMATED QA TEST SUITE     " -ForegroundColor Cyan
Write-Host " Target API: $BaseUrl                                     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$passCount = 0
$failCount = 0

function Assert-Step($condition, $description) {
    if ($condition) {
        Write-Host " [PASS] $description" -ForegroundColor Green
        $script:passCount++
    } else {
        Write-Host " [FAIL] $description" -ForegroundColor Red
        $script:failCount++
        throw "Assertion failure: $description"
    }
}

# --- 1. HEALTH CHECK ---
Write-Host "`n[STAGE 1] System Health & Database Connectivity" -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get
Assert-Step ($health.success -eq $true -and $health.data.status -eq "UP" -and $health.data.database -eq "CONNECTED") "Service is UP and PostgreSQL database is CONNECTED"

# --- 2. AUTHENTICATION: REGISTRATION ---
Write-Host "`n[STAGE 2] Role-Based User Registration" -ForegroundColor Yellow
$uniqueId = Get-Random -Minimum 100000 -Maximum 999999

# Student Registration
$studentReg = @{
    email = "qa.student.$uniqueId@school.edu"
    password = "SecurePassword123!"
    firstName = "Elena"
    lastName = "Rostova"
    role = "STUDENT"
    studentIdNumber = "STU-$uniqueId"
    gradeLevel = "Grade 11-A"
} | ConvertTo-Json

$studentAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $studentReg
Assert-Step ($studentAuth.success -eq $true -and $studentAuth.data.token -ne $null) "Student registered with valid JWT token"
$studentToken = $studentAuth.data.token
$studentProfileId = $studentAuth.data.studentProfile.id
Write-Host "   -> Registered Student ID: $studentProfileId (Identifier: STU-$uniqueId)"

# Teacher Registration
$teacherReg = @{
    email = "qa.teacher.$uniqueId@school.edu"
    password = "SecurePassword123!"
    firstName = "Marcus"
    lastName = "Vance"
    role = "TEACHER"
    employeeId = "FAC-$uniqueId"
    department = "Computer Science"
    invitationCode = "TEACHER_SECRET_2026"
} | ConvertTo-Json

$teacherAuth = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $teacherReg
Assert-Step ($teacherAuth.success -eq $true -and $teacherAuth.data.token -ne $null) "Teacher registered with valid JWT token"
$teacherToken = $teacherAuth.data.token
$teacherProfileId = $teacherAuth.data.teacherProfile.id
Write-Host "   -> Registered Teacher ID: $teacherProfileId (Employee ID: FAC-$uniqueId)"

# --- 3. LOGIN & CREDENTIAL VALIDATION ---
Write-Host "`n[STAGE 3] Login & Credential Security" -ForegroundColor Yellow
$loginValid = @{
    email = "qa.student.$uniqueId@school.edu"
    password = "SecurePassword123!"
} | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginValid
Assert-Step ($loginRes.success -eq $true -and $loginRes.data.user.email -eq "qa.student.$uniqueId@school.edu") "Student login succeeded with correct credentials"

# Invalid Password Test
$loginInvalid = @{
    email = "qa.student.$uniqueId@school.edu"
    password = "BadPassword999!"
} | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginInvalid
    Assert-Step $false "Invalid password must be rejected"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 401 -or $code -eq 400) "Invalid credentials correctly rejected with status $code"
}

# --- 4. SESSION RESTORATION & TOKEN VERIFICATION ---
Write-Host "`n[STAGE 4] Session Restoration (/api/v1/auth/me)" -ForegroundColor Yellow
$studentHeaders = @{ Authorization = "Bearer $studentToken" }
$meStudent = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method Get -Headers $studentHeaders
Assert-Step ($meStudent.success -eq $true -and $meStudent.data.user.role -eq "STUDENT") "Student /auth/me returns valid student profile session"

$teacherHeaders = @{ Authorization = "Bearer $teacherToken" }
$meTeacher = Invoke-RestMethod -Uri "$BaseUrl/auth/me" -Method Get -Headers $teacherHeaders
Assert-Step ($meTeacher.success -eq $true -and $meTeacher.data.user.role -eq "TEACHER") "Teacher /auth/me returns valid teacher profile session"

# --- 5. SECURITY & ROLE AUTHORIZATION ---
Write-Host "`n[STAGE 5] Role-Based Access Control Guards" -ForegroundColor Yellow
# Unauthenticated request
try {
    Invoke-RestMethod -Uri "$BaseUrl/students" -Method Get
    Assert-Step $false "Unauthenticated access should fail"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 401) "Unauthenticated request to protected endpoint returns 401 Unauthorized"
}

# Student accessing teacher-only directory
try {
    Invoke-RestMethod -Uri "$BaseUrl/students" -Method Get -Headers $studentHeaders
    Assert-Step $false "Student accessing teacher directory should fail"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 403) "Student attempting to access student directory returns 403 Forbidden"
}

# Student attempting to award points
try {
    $illegalAward = @{
        studentId = $studentProfileId
        points = 50
        transactionType = "ACADEMIC"
        reason = "Self award exploit attempt"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $studentHeaders -Body $illegalAward
    Assert-Step $false "Student awarding points should fail"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 403) "Student attempting to award points returns 403 Forbidden"
}

# --- 6. POINT MANAGEMENT & AUDIT LOGGING ---
Write-Host "`n[STAGE 6] Point Management Flow (Award, Deduct, Adjust)" -ForegroundColor Yellow
# 1. Award 100 points
$award100 = @{
    studentId = $studentProfileId
    points = 100
    transactionType = "ACADEMIC"
    reason = "Perfect score in Final Project demonstration"
} | ConvertTo-Json
$awardRes = Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $award100
Assert-Step ($awardRes.success -eq $true -and $awardRes.data.updatedTotalPoints -eq 100) "Teacher awards 100 ACADEMIC points -> balance = 100"

# 2. Penalty deduction -25
$penalty25 = @{
    studentId = $studentProfileId
    points = -25
    transactionType = "PENALTY"
    reason = "Disciplinary penalty for missed session"
} | ConvertTo-Json
$penaltyRes = Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $penalty25
Assert-Step ($penaltyRes.success -eq $true -and $penaltyRes.data.updatedTotalPoints -eq 75) "Teacher applies -25 PENALTY deduction -> balance = 75"

# 3. Manual adjustment +15
$adjust15 = @{
    studentId = $studentProfileId
    points = 15
    transactionType = "ADJUSTMENT"
    reason = "Correction for clerical score omission"
} | ConvertTo-Json
$adjustRes = Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $adjust15
Assert-Step ($adjustRes.success -eq $true -and $adjustRes.data.updatedTotalPoints -eq 90) "Teacher applies +15 ADJUSTMENT -> balance = 90"

# 4. Student verifies updated balance & transaction ledger
$studentProfile = Invoke-RestMethod -Uri "$BaseUrl/students/me/profile" -Method Get -Headers $studentHeaders
Assert-Step ($studentProfile.data.totalPoints -eq 90) "Student profile reflects verified balance of 90 points"

$txLedger = Invoke-RestMethod -Uri "$BaseUrl/students/$studentProfileId/transactions?page=0&size=10" -Method Get -Headers $studentHeaders
Assert-Step ($txLedger.data.totalElements -eq 3) "Student ledger contains exactly 3 immutable transaction records"

# --- 7. INPUT VALIDATION & NEGATIVE SCORE PREVENTION ---
Write-Host "`n[STAGE 7] Validation Guards & Rollback Consistency" -ForegroundColor Yellow
# Negative balance deduction
try {
    $excessDeduct = @{
        studentId = $studentProfileId
        points = 99999
        transactionType = "PENALTY"
        reason = "Attempting negative balance"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $excessDeduct
    Assert-Step $false "Excessive deduction should fail"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 400) "Deduction exceeding student points balance rejected with 400 Bad Request"
}

# Non-existent student
try {
    $badStudent = @{
        studentId = 8888888
        points = 10
        transactionType = "ACADEMIC"
        reason = "Non-existent student"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $badStudent
    Assert-Step $false "Award to invalid student ID should fail"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Assert-Step ($code -eq 404) "Awarding to non-existent student rejected with 404 Not Found"
}

# --- 8. DYNAMIC LEADERBOARD & COMPETITION RANKING ---
Write-Host "`n[STAGE 8] Dynamic Leaderboard & Competition Ranking" -ForegroundColor Yellow
# Register two benchmark students
$stuAId = $studentProfileId # Elena, current = 90 pts

# Student B
$regB = @{
    email = "stuB.$uniqueId@school.edu"; password = "Password123!"; firstName = "Boris"; lastName = "Ivanov"; role = "STUDENT"; studentIdNumber = "STU-B-$uniqueId"; gradeLevel = "Grade 11"
} | ConvertTo-Json
$authB = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regB
$stuBId = $authB.data.studentProfile.id

# Student C
$regC = @{
    email = "stuC.$uniqueId@school.edu"; password = "Password123!"; firstName = "Clara"; lastName = "Oswald"; role = "STUDENT"; studentIdNumber = "STU-C-$uniqueId"; gradeLevel = "Grade 11"
} | ConvertTo-Json
$authC = Invoke-RestMethod -Uri "$BaseUrl/auth/register" -Method Post -ContentType "application/json" -Body $regC
$stuCId = $authC.data.studentProfile.id

# Award Student B and C equal scores: 150 points each
$awardB = @{ studentId = $stuBId; points = 150; transactionType = "ACADEMIC"; reason = "Math contest" } | ConvertTo-Json
$awardC = @{ studentId = $stuCId; points = 150; transactionType = "ACADEMIC"; reason = "Physics contest" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $awardB | Out-Null
Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $awardC | Out-Null

# Verify Leaderboard Rankings
$lb = Invoke-RestMethod -Uri "$BaseUrl/leaderboard?page=0&size=20" -Method Get -Headers $studentHeaders
$entryB = $lb.data.content | Where-Object { $_.studentId -eq $stuBId }
$entryC = $lb.data.content | Where-Object { $_.studentId -eq $stuCId }
$entryA = $lb.data.content | Where-Object { $_.studentId -eq $stuAId }

Assert-Step ($entryB.rank -eq $entryC.rank) "Tied scores (150 pts) share the exact same rank position ($($entryB.rank))"
Assert-Step ($entryA.rank -gt $entryB.rank) "Lower score (90 pts) receives lower rank ($($entryA.rank))"

# Re-ordering test: Award Elena (Student A) +200 points
$awardExtra = @{ studentId = $stuAId; points = 200; transactionType = "ACADEMIC"; reason = "Grand Prize Award" } | ConvertTo-Json
Invoke-RestMethod -Uri "$BaseUrl/points/award" -Method Post -ContentType "application/json" -Headers $teacherHeaders -Body $awardExtra | Out-Null

$lbUpdated = Invoke-RestMethod -Uri "$BaseUrl/leaderboard?page=0&size=20" -Method Get -Headers $studentHeaders
$entryANew = $lbUpdated.data.content | Where-Object { $_.studentId -eq $stuAId }
Assert-Step ($entryANew.totalPoints -eq 290 -and $entryANew.rank -eq 1) "Dynamic re-ordering: Elena promoted to Rank 1 with 290 points"

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " TEST RUN COMPLETE: $passCount Passed, $failCount Failed (100% Success)" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
