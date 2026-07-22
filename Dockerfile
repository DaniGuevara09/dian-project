# Stage 1: Construcción del Jar de Spring Boot con Maven y Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar configuración y código fuente
COPY pom.xml .
COPY src ./src

# Compilar ejecutable JAR ignorando pruebas de entorno local
RUN mvn clean package -DskipTests

# Stage 2: Entorno ejecutable ligero con Java 17 JRE
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar el paquete compilado desde la etapa anterior
COPY --from=build /app/target/*.jar app.jar

# Exponer el puerto del servidor HTTP / Web Services
EXPOSE 8080

# Comando de inicio del servidor Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]
