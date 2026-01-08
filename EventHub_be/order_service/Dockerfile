# ---- Runtime stage ----
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy pre-built JAR from local build folder
COPY build/libs/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5006", "-jar", "app.jar"]

