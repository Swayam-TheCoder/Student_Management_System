@echo off
setlocal enabledelayedexpansion

echo ==============================================================================
echo Student Management System - Windows Local Startup Script
echo ==============================================================================

cd /d "%~dp0"

set "ENV_FILE="
if exist ".env" set "ENV_FILE=.env"
if not defined ENV_FILE if exist "..\.env" set "ENV_FILE=..\.env"

if defined ENV_FILE (
    echo [INFO] Loading local environment from %ENV_FILE%
    for /f "usebackq tokens=1* delims==" %%A in ("%ENV_FILE%") do (
        set "LINE_KEY=%%A"
        set "LINE_VAL=%%B"
        if not "!LINE_KEY:~0,1!"=="#" (
            for /f "tokens=* delims= " %%K in ("!LINE_KEY!") do set "LINE_KEY=%%K"
            if defined LINE_KEY (
                set "!LINE_KEY!=!LINE_VAL!"
            )
        )
    )
) else (
    echo [INFO] No .env file found. Using default environment variables.
)

if not exist "target\student-management-system-1.0.0.jar" (
    echo [INFO] Target JAR not found. Building package...
    call mvn clean package -DskipTests
)

echo [INFO] Starting Spring Boot application on port %SERVER_PORT%...
java -jar target\student-management-system-1.0.0.jar
