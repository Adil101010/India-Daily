package com.indiadaily.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    // NOTE: Password will be stored hashed (BCrypt)
    @Column(nullable = false)
    private String password;

    // default role = ADMIN
    @Column(nullable = false)
    private String role = "ADMIN";
}
