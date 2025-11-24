package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.News;
import com.indiadaily.backend.service.NewsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin("*")
public class NewsController {

    private final NewsService service;

    public NewsController(NewsService service) {
        this.service = service;
    }

    // ==========================
    // ADD NEWS (multipart/form-data)
    // ==========================
    @PostMapping(value = "/add", consumes = {"multipart/form-data"})
    public News add(
            @RequestPart("title") String title,
            @RequestPart("category") String category,
            @RequestPart("status") String status,
            @RequestPart("content") String content,
            @RequestPart(value = "author", required = false) String author,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        // agar frontend se author na aaye to default "Admin"
        String finalAuthor = (author == null || author.isBlank()) ? "Admin" : author.trim();
        return service.addNews(title, category, finalAuthor, status, content, image);
    }

    // ==========================
    // GET ALL
    // ==========================
    @GetMapping("/all")
    public List<News> all() {
        return service.getAll();
    }

    // ==========================
    // GET BY ID
    // ==========================
    @GetMapping("/{id}")
    public News one(@PathVariable Long id) {
        return service.getById(id);
    }

    // ==========================
    // UPDATE (with OR without image)
    // ==========================
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public News update(
            @PathVariable Long id,
            @RequestPart("title") String title,
            @RequestPart("category") String category,
            @RequestPart("status") String status,
            @RequestPart("content") String content,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return service.updateNews(id, title, category, status, content, image);
    }

    // ==========================
    // DELETE
    // ==========================
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return service.delete(id) ? "DELETED" : "NOT FOUND";
    }
}
