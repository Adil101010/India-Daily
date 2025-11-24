package com.indiadaily.backend.repository;

import com.indiadaily.backend.model.News;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long> {

    // For slug-based article page
    Optional<News> findBySlug(String slug);

    // For category page (latest first)
    List<News> findByCategoryOrderByPublishedAtDesc(String category);

    // For home page latest news
    List<News> findTop10ByStatusOrderByPublishedAtDesc(String status);

    // For trending news (views high first)
    List<News> findTop5ByStatusOrderByViewsDesc(String status);

    // For featured stories on home page
    List<News> findByFeaturedTrueOrderByPublishedAtDesc();
}
