package com.indiadaily.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class SubCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;   // Hindi → “क्रिकेट”

    @Column(nullable = false, unique = true)
    private String slug;   // English slug → “cricket”

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
