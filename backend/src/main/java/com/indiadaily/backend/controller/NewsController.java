package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.News;
import com.indiadaily.backend.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/news")
@CrossOrigin("*")
public class NewsController {

    private final NewsService service;

    public NewsController(NewsService service) {
        this.service = service;
    }

    // ==========================================================
    // ADD NEWS (multipart/form-data)
    // ==========================================================
    @PostMapping(value = "/add", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addNews(
            @RequestPart("title") String title,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart(value = "author", required = false) String authorName,
            @RequestPart(value = "status", required = false) String status,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "featured", required = false) Boolean featured,
            @RequestPart(value = "breaking", required = false) Boolean breaking
    ) {

        News saved = service.addNews(
                title,
                category,
                authorName,
                status,
                content,
                image
        );

        return ResponseEntity.ok(saved);
    }


    // ==========================================================
    // UPDATE NEWS (multipart/form-data)
    // ==========================================================
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> updateNews(
            @PathVariable Long id,
            @RequestPart(value = "title", required = false) String title,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart(value = "status", required = false) String status,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "author", required = false) String authorName,
            @RequestPart(value = "featured", required = false) Boolean featured,
            @RequestPart(value = "breaking", required = false) Boolean breaking
    ) {

        News updated = service.updateNews(
                id,
                title,
                category,
                status,
                content,
                image,
                authorName,
                featured,
                breaking
        );

        if (updated == null)
            return ResponseEntity.status(404).body("NOT FOUND");

        return ResponseEntity.ok(updated);
    }

    // ==========================================================
    // DELETE NEWS
    // ==========================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable Long id) {
        boolean ok = service.delete(id);

        if (!ok)
            return ResponseEntity.status(404).body("NOT FOUND");

        return ResponseEntity.ok("DELETED");
    }

    // ==========================================================
    // GET ALL NEWS (Admin)
    // ==========================================================
    @GetMapping("/all")
    public ResponseEntity<?> all() {
        return ResponseEntity.ok(service.getAll());
    }

    // ==========================================================
    // GET SINGLE NEWS (Admin)
    // ==========================================================
    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable Long id) {
        News news = service.getById(id);

        if (news == null)
            return ResponseEntity.status(404).body("NOT FOUND");

        return ResponseEntity.ok(news);
    }
}
