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
    // SUBCATEGORIES (for a category)
    // /api/public/news/subcategories?category=Sports
    // ==========================
    @GetMapping("/subcategories")
    public ResponseEntity<List<String>> getSubCategories(@RequestParam("category") String category) {
        return ResponseEntity.ok(newsService.getSubCategoriesByCategory(category));
    }

    // ==========================
    // CATEGORY + SUBCATEGORY FILTER
    // /api/public/news/category/filter?category=Sports&subcategory=Cricket
    // ==========================
    @GetMapping("/category/filter")
    public ResponseEntity<List<News>> filterByCategoryAndSubcategory(
            @RequestParam("category") String category,
            @RequestParam(value = "subcategory", required = false) String subcategory
    ) {
        return ResponseEntity.ok(newsService.getByCategoryAndSubcategory(category, subcategory));
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
    // ==========================
// EDITORIALS (right column)
// /api/public/news/editorials?limit=5
// ==========================
    @GetMapping("/editorials")
    public ResponseEntity<?> getEditorials(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(newsService.getEditorials(limit));
    }

}
