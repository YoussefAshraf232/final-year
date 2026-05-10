package com.john.inflow;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:inflow_test;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none",
        "inflow.scheduling.enabled=false",
        "inflow.jwt.secret=test-secret-32-bytes-or-more-AAAAAAAA!",
        "inflow.notifications.low-stock-delay-ms=3600000"
})
class InflowApplicationTests {
    @Test
    void contextLoads() {
    }
}
