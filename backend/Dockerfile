FROM openjdk:17
WORKDIR /backend
COPY . /backend
RUN javac -cp "sqlite-jdbc-3.42.0.0.jar;." Api.java Database.java Utils.java RouteFinder.java
CMD ["java", "-cp", "sqlite-jdbc-3.42.0.0.jar;.", "Api"]
