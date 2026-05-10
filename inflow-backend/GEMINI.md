# GEMINI.md - Inflow Backend

## Project Overview
**Inflow** is a robust Supply Chain Management (SCM) backend service designed to streamline warehouse operations, manage inventory flow, and track personnel. It provides a RESTful API built with Java and Spring Boot.

### Core Technologies
- **Language:** Java 21
- **Framework:** Spring Boot 4.0.5
- **Database:** PostgreSQL
- **Migrations:** Flyway
- **ORM:** Spring Data JPA (Hibernate)
- **Build Tool:** Maven (with wrapper)
- **Utilities:** Lombok, Jakarta Validation

### Architecture
The project follows a standard Spring Boot layered architecture:
- **Controllers:** Located in `com.john.inflow.controller`.
- **Services:** Located in `com.john.inflow.service`.
- **Entities:** Located in `com.john.inflow.entity`.
- **DTOs:** Located in `com.john.inflow.dto` (`request` and `response` subpackages). Implemented as immutable Java `record`s.
- **Repositories:** Located in `com.john.inflow.repository`, extending `JpaRepository` for data access.
- **Database Schema:** Managed via Flyway migrations in `src/main/resources/db/migration/`.
- **Validation:** Uses Jakarta Bean Validation (`@NotBlank`, `@NotNull`, etc.) within entities and DTOs.
- **Boilerplate:** Lombok is used for entity classes.

---

## Building and Running

### Prerequisites
- **JDK 21**
- **PostgreSQL 15+**
- **Maven** (optional, use `./mvnw`)

### Key Commands
- **Build the project:**
  ```bash
  ./mvnw clean install
  ```
- **Run the application:**
  ```bash
  ./mvnw spring-boot:run
  ```
- **Run tests:**
  ```bash
  ./mvnw test
  ```

### Configuration
The application uses `src/main/resources/application.properties`. 
- **Port:** Defaults to `9090`.
- **Database:** Requires a PostgreSQL instance. Credentials should be provided via environment variables:
    - `INFLOW_DB_USERNAME`
    - `INFLOW_DB_PASSWORD`
- **Profiles:** Defaults to `dev`.

---

## Development Conventions

### Coding Style
- Follow standard Java naming conventions (CamelCase).
- Use **Lombok** for entity classes to reduce boilerplate (`@Getter`, `@Setter`, `@Builder`, etc.).
- Use **Java Records** for all DTOs (Data Transfer Objects). Suffix DTO names with `Request` or `Response` (do not use `DTO` as a suffix). Do not use Lombok on records.
- Prefer **constructor injection** for dependencies.

### Persistence & Migrations
- **Repositories:** Interfaces must extend `JpaRepository` and use the appropriate ID type (including `@EmbeddedId` for composite keys).
- **Do not** use `hibernate.ddl-auto=update`. All schema changes **must** be performed through **Flyway migration scripts** in `src/main/resources/db/migration/`.
- Use `OffsetDateTime` for timestamp fields to ensure timezone consistency.

### Validation
- Always use Jakarta Validation annotations on entity fields to ensure data integrity at the API level.

### Testing
- Place tests in `src/test/java`.
- Use `@SpringBootTest` for integration tests and `@DataJpaTest` for repository-layer tests.