# 1. Aşama: Maven ile Projeyi Derleme (Build Stage)
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app

# Bağımlılık indirmeyi önbelleğe almak için önce pom.xml'i kopyalıyoruz
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Kaynak kodları kopyalayıp uygulamayı derliyoruz
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Aşama: Çalıştırma Aşaması (Runtime Stage)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Derlenen jar dosyasını kopyalıyoruz
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
