package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.News;
import com.indiadaily.backend.service.NewsService;
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
    // LATEST NEWS (home page)
    // /api/public/news/latest?limit=10
    // ==========================
    @GetMapping("/latest")
    public List<News> getLatest(@RequestParam(defaultValue = "10") int limit) {
        return newsService.getLatestPublished(limit);
    }

    // ==========================
    // TRENDING NEWS
    // /api/public/news/trending?limit=5
    // ==========================
    @GetMapping("/trending")
    public List<News> getTrending(@RequestParam(defaultValue = "5") int limit) {
        return newsService.getTrending(limit);
    }

    // ==========================
    // FEATURED NEWS (hero section)
    // /api/public/news/featured
    // ==========================
    @GetMapping("/featured")
    public List<News> getFeatured() {
        return newsService.getFeatured();
    }

    // ==========================
    // CATEGORY WISE LISTING
    // /api/public/news/category?name=Politics
    // (abhi simple name se, baad me slug kar sakte)
    // ==========================
    @GetMapping("/category")
    public List<News> getByCategory(@RequestParam("name") String category) {
        return newsService.getByCategory(category);
    }

    // ==========================
    // SINGLE ARTICLE BY SLUG
    // /api/public/news/article/{slug}
    // ==========================
    @GetMapping("/article/{slug}")
    public News getBySlug(@PathVariable String slug) {
        return newsService.getBySlugAndIncreaseViews(slug);
    }
}
