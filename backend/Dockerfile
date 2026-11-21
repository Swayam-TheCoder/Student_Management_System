# ==============================================================================
# Multi-Stage Dockerfile for Student Management System (Spring Boot Backend)
# Target Platform: Render / Cloud Container Deployment
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Stage (Maven + Eclipse Temurin JDK 17)
# ------------------------------------------------------------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /workspace

# Copy pom.xml first to optimize Docker layer caching for dependencies
COPY pom.xml .

# Pre-fetch project dependencies offline (continues if offline lookup warns)
RUN mvn dependency:go-offline -B || true

# Copy application source code
COPY src ./src

# Build production JAR (tests skipped during image build for reproducible artifacts)
RUN mvn clean package -DskipTests -B

# ------------------------------------------------------------------------------
# Stage 2: Runtime Stage (Eclipse Temurin JRE 17)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a dedicated non-root system group and user for security
RUN groupadd -r spring && useradd -r -g spring -d /app -s /sbin/nologin spring \
    && mkdir -p /app \
    && chown -R spring:spring /app

# Copy the packaged JAR from the builder stage
COPY --from=builder --chown=spring:spring /workspace/target/student-management-system-1.0.0.jar student-management-system-1.0.0.jar

# Switch to the non-root user
USER spring

# Expose default HTTP port (overridden dynamically by Render via PORT env var)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "student-management-system-1.0.0.jar"]
