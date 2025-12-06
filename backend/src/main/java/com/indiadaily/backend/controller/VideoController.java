package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.Video;
import com.indiadaily.backend.repository.VideoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class VideoController {

    private final VideoRepository repo;

    public VideoController(VideoRepository repo) {
        this.repo = repo;
    }

    // ===== PUBLIC: Latest 4 Videos =====
    @GetMapping("/public/videos/latest")
    public ResponseEntity<List<Video>> getLatestVideos() {
        return ResponseEntity.ok(repo.findTop4ByOrderByCreatedAtDesc());
    }

    // ===== ADMIN: Add Video =====
    @PostMapping("/videos/add")
    public ResponseEntity<?> addVideo(@RequestBody Video video) {
        if (video.getYoutubeUrl() == null || video.getYoutubeUrl().isBlank()) {
            return ResponseEntity.badRequest().body("YouTube URL is required");
        }
        if (video.getTitle() == null || video.getTitle().isBlank()) {
            video.setTitle("Untitled Video");
        }
        Video saved = repo.save(video);
        return ResponseEntity.ok(saved);
    }

    // ===== ADMIN: Get All Videos =====
    @GetMapping("/videos/all")
    public ResponseEntity<List<Video>> getAllVideos() {
        return ResponseEntity.ok(repo.findAll());
    }

    // ===== ADMIN: Delete Video =====
    @DeleteMapping("/videos/{id}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(404).body("NOT FOUND");
        }
        repo.deleteById(id);
        return ResponseEntity.ok("DELETED");
    }
}
