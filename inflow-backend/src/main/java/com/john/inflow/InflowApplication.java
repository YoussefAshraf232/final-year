package com.john.inflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class InflowApplication {

	public static void main(String[] args) {
		SpringApplication.run(InflowApplication.class, args);
	}
	@GetMapping("/")
	public String hello() {
		return "Let the fun begins";
	}

}
