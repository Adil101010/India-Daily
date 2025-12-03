package com.indiadaily.backend.repository;

import com.indiadaily.backend.model.News;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsRepository extends JpaRepository<News, Long> {

    // ==========================
    // SLUG (Article Page)
    // ==========================
    Optional<News> findBySlug(String slug);

    // ==========================
    // CATEGORY (Ignore Case + Latest First)
    // ==========================
    List<News> findByCategoryIgnoreCaseOrderByPublishedAtDesc(String category);

    // ==========================
    // CATEGORY + SUBCATEGORY (Ignore Case + Latest First)
    // ==========================
    List<News> findByCategoryIgnoreCaseAndSubcategoryIgnoreCaseOrderByPublishedAtDesc(
            String category,
            String subcategory
    );

    // ==========================
    // ALL NEWS IN CATEGORY (for distinct subcategories)
    // ==========================
    List<News> findByCategoryIgnoreCase(String category);

    // ==========================
    // LATEST PUBLISHED (Dynamic limit via Pageable)
    // ==========================
    List<News> findByStatusOrderByPublishedAtDesc(String status, Pageable pageable);

    // ==========================
    // TRENDING (Views Based)
    // ==========================
    List<News> findByStatusOrderByViewsDesc(String status, Pageable pageable);

    // ==========================
    // FEATURED (Hero Section)
    // ==========================
    List<News> findByFeaturedTrueOrderByPublishedAtDesc();


}
