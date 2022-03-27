FROM public.ecr.aws/docker/library/amazoncorretto:11-alpine-jdk AS builder
COPY . /build-dir
WORKDIR build-dir
RUN ./gradlew shadowjar

FROM public.ecr.aws/amazoncorretto/amazoncorretto:11
WORKDIR /cdk-sample-backend
COPY --from=builder /build-dir/app/build/libs/app-1.0.0-SNAPSHOT-all.jar .
EXPOSE 8080/tcp
CMD ["java", "-jar", "app-1.0.0-SNAPSHOT-all.jar"]
