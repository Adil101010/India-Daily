package com.indiadaily.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.indiadaily.backend.model.News;
import com.indiadaily.backend.service.NewsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/news")
@CrossOrigin("*")
public class NewsController {

    private final NewsService service;
    private final Cloudinary cloudinary;

    public NewsController(NewsService service, Cloudinary cloudinary) {
        this.service = service;
        this.cloudinary = cloudinary;
    }

    // ==========================================================
    // ADD NEWS
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

        // ✅ Cloudinary upload (if image exists)
        MultipartFile processedImage = image;
        if (image != null && !image.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(
                        image.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "india-daily/news",
                                "resource_type", "image"
                        )
                );
                String cloudinaryUrl = (String) uploadResult.get("secure_url");

                // Create a wrapper to pass Cloudinary URL to service
                // (service will handle storing this URL in News entity)
                processedImage = new CloudinaryMultipartFile(cloudinaryUrl);

            } catch (Exception e) {
                return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
            }
        }

        News saved = service.addNews(
                title,
                category,
                authorName,
                status,
                content,
                processedImage
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
            @RequestPart(value = "subcategory", required = false) String subcategory,
            @RequestPart(value = "status", required = false) String status,
            @RequestPart(value = "content", required = false) String content,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "author", required = false) String authorName,
            @RequestPart(value = "featured", required = false) Boolean featured,
            @RequestPart(value = "breaking", required = false) Boolean breaking
    ) {

        // ✅ Cloudinary upload (if new image provided)
        MultipartFile processedImage = image;
        if (image != null && !image.isEmpty()) {
            try {
                Map uploadResult = cloudinary.uploader().upload(
                        image.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "india-daily/news",
                                "resource_type", "image"
                        )
                );
                String cloudinaryUrl = (String) uploadResult.get("secure_url");
                processedImage = new CloudinaryMultipartFile(cloudinaryUrl);

            } catch (Exception e) {
                return ResponseEntity.status(500).body("Image upload failed: " + e.getMessage());
            }
        }

        News updated = service.updateNews(
                id,
                title,
                category,
                subcategory,
                status,
                content,
                processedImage,
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

    // ==========================================================
    // Helper class to wrap Cloudinary URL
    // ==========================================================
    private static class CloudinaryMultipartFile implements MultipartFile {
        private final String url;

        public CloudinaryMultipartFile(String url) {
            this.url = url;
        }

        @Override public String getName() { return "cloudinary-image"; }
        @Override public String getOriginalFilename() { return url; }
        @Override public String getContentType() { return "image/jpeg"; }
        @Override public boolean isEmpty() { return false; }
        @Override public long getSize() { return 0; }
        @Override public byte[] getBytes() { return new byte[0]; }
        @Override public java.io.InputStream getInputStream() { return null; }
        @Override public void transferTo(java.io.File dest) {}
    }
}
