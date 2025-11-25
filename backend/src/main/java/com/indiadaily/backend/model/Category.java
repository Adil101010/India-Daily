package com.indiadaily.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;    // Hindi name → “राजनीति”

    @Column(nullable = false, unique = true)
    private String slug;    // English slug → “politics”
}
