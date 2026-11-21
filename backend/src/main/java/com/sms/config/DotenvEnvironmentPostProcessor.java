package com.sms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads environment variables from local .env files into Spring's Environment
 * before application context initialization and data source configuration.
 *
 * Precedence:
 * 1. System environment variables (Render / Docker / OS) always take precedence.
 * 2. .env file properties are applied if not already set in the system environment.
 * 3. Default application.yml fallbacks apply if neither is present.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger log = LoggerFactory.getLogger(DotenvEnvironmentPostProcessor.class);
    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        List<Path> searchCandidates = Arrays.asList(
            Paths.get(".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", ".env"),
            Paths.get("..", "backend", ".env")
        );

        Path resolvedEnvPath = null;
        for (Path candidate : searchCandidates) {
            if (Files.exists(candidate) && !Files.isDirectory(candidate)) {
                resolvedEnvPath = candidate.toAbsolutePath().normalize();
                break;
            }
        }

        if (resolvedEnvPath == null) {
            log.info("[Dotenv] No .env file discovered in standard locations. Relying on container / OS environment.");
            return;
        }

        log.info("[Dotenv] Loading environment configuration from: {}", resolvedEnvPath);
        Map<String, Object> loadedProperties = new HashMap<>();

        try (BufferedReader reader = Files.newBufferedReader(resolvedEnvPath, StandardCharsets.UTF_8)) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                if (line.startsWith("export ")) {
                    line = line.substring(7).trim();
                }
                int separatorIdx = line.indexOf('=');
                if (separatorIdx > 0) {
                    String key = line.substring(0, separatorIdx).trim();
                    String value = line.substring(separatorIdx + 1).trim();

                    // Strip wrapping single or double quotes
                    if ((value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) ||
                        (value.startsWith("'") && value.endsWith("'") && value.length() >= 2)) {
                        value = value.substring(1, value.length() - 1);
                    }

                    loadedProperties.put(key, value);
                }
            }

            if (!loadedProperties.isEmpty()) {
                if (environment.getPropertySources().contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                    environment.getPropertySources().addAfter(
                        StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                        new MapPropertySource(PROPERTY_SOURCE_NAME, loadedProperties)
                    );
                } else {
                    environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, loadedProperties));
                }
                log.info("[Dotenv] Successfully registered {} properties into Spring Environment", loadedProperties.size());
            }
        } catch (IOException e) {
            log.warn("[Dotenv] Error reading .env file at {}: {}", resolvedEnvPath, e.getMessage());
        }
    }

    @Override
    public int getOrder() {
        // Run early (before ConfigDataEnvironmentPostProcessor which is HIGHEST_PRECEDENCE + 10)
        return Ordered.HIGHEST_PRECEDENCE + 9;
    }
}
