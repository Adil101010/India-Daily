package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.News;
import com.indiadaily.backend.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/news")
@CrossOrigin("*")
public class PublicNewsController {

    private final NewsService newsService;

    public PublicNewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    // ==========================
    // LATEST NEWS (Home)
    // /api/public/news/latest?limit=10
    // ==========================
    @GetMapping("/latest")
    public ResponseEntity<?> getLatest(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(newsService.getLatestPublished(limit));
    }

    // ==========================
    // TRENDING NEWS
    // /api/public/news/trending?limit=5
    // ==========================
    @GetMapping("/trending")
    public ResponseEntity<?> getTrending(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(newsService.getTrending(limit));
    }

    // ==========================
    // FEATURED NEWS (Hero)
    // ==========================
    @GetMapping("/featured")
    public ResponseEntity<?> getFeatured() {
        return ResponseEntity.ok(newsService.getFeatured());
    }

    // ==========================
    // CATEGORY (ignore-case)
    // /api/public/news/category?name=Sports
    // ==========================
    @GetMapping("/category")
    public ResponseEntity<?> getByCategory(@RequestParam("name") String category) {
        return ResponseEntity.ok(newsService.getByCategory(category));
    }

    // ==========================
    // ARTICLE PAGE (slug)
    // /api/public/news/article/india-wins-2025
    // ==========================
    @GetMapping("/article/{slug}")
    public ResponseEntity<?> getBySlug(@PathVariable String slug) {
        News news = newsService.getBySlugAndIncreaseViews(slug);

        if (news == null)
            return ResponseEntity.status(404).body("Article not found");

        return ResponseEntity.ok(news);
    }
}
