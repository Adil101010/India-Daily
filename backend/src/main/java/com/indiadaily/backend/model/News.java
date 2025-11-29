package com.indiadaily.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import com.indiadaily.backend.model.Author;
import jakarta.persistence.Embedded;
@Entity
@Table(name = "news")
@Getter
@Setter
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String content;

    @Column(unique = true)
    private String slug;

    private String summary;

    private String category;


    // ⭐ Added for subcategories like "फनी क्लिप्स", "देश क्राइम", etc.
    private String subcategory;

    private String imageUrl;

    @Embedded
    private Author author;

    @CreationTimestamp
    private LocalDateTime publishedAt;

    private int views = 0;

    private String status = "DRAFT";

    private boolean featured = false;

    private boolean breaking = false;
}
