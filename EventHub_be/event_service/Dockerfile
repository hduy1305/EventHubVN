# ---- Runtime stage ----
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy pre-built JAR from local build folder
COPY build/libs/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]

