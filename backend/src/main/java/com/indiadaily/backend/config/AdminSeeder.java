package com.indiadaily.backend.config;

import com.indiadaily.backend.model.Admin;
import com.indiadaily.backend.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner initAdmin(AdminRepository adminRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepo.count() == 0) {
                Admin admin = new Admin();
                admin.setName("Super Admin");
                admin.setEmail("admin@indiadaily.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole("ADMIN");   // ya jo bhi field value tum use karte ho
                adminRepo.save(admin);
            }
        };
    }
}
