package com.indiadaily.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Entity
@Table(name = "news")
@Getter
@Setter
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Main content
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    // SEO friendly URL: e.g. "pm-modi-addresses-nation"
    // Optional for now: Add News API me auto-generate kar sakte ho
    @Column(unique = true)
    private String slug;

    // Short description for listing cards
    @Column(length = 255)
    private String summary;

    // Category: abhi String hi rakha hai (baad me relation bana sakte hain)
    private String category;

    private String imageUrl;

    private String author;

    @Temporal(TemporalType.TIMESTAMP)
    private Date publishedAt = new Date();

    private int views = 0;

    // Published / Draft
    private String status;

    // Home page hero / top story ke liye
    private boolean featured = false;

    // Breaking news badge ke liye
    private boolean breaking = false;
}
