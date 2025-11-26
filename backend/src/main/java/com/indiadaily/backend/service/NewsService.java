package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Author;
import com.indiadaily.backend.model.News;
import com.indiadaily.backend.repository.NewsRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class NewsService {

    private final NewsRepository repo;

    public NewsService(NewsRepository repo) {
        this.repo = repo;
    }

    // =====================================
    // IMAGE UPLOAD
    // =====================================
    private String uploadImage(MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {

                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String originalName = image.getOriginalFilename();
                if (originalName == null) originalName = "image";

                String cleanedName = originalName.replaceAll("\\s+", "_");
                String fileName = System.currentTimeMillis() + "_" + cleanedName;

                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, image.getBytes());

                return "http://localhost:8080/" + uploadDir + fileName;
            }
        } catch (Exception e) {
            System.out.println("Image upload failed: " + e.getMessage());
        }
        return null;
    }

    // =====================================
    // ADD NEWS
    // =====================================
    public News addNews(String title,
                        String category,
                        String authorName,
                        String status,
                        String content,
                        MultipartFile image) {

        News n = new News();

        n.setTitle(title);
        n.setCategory(category);
        n.setContent(content);

        Author author = new Author();
        author.setName(authorName != null ? authorName.trim() : "India Daily");
        author.setBio(null);
        author.setAvatar(null);
        n.setAuthor(author);

        String finalStatus =
                (status == null || status.isBlank())
                        ? "DRAFT"
                        : status.trim().toUpperCase(Locale.ROOT);

        n.setStatus(finalStatus);
        n.setSummary(buildSummary(content));
        n.setSlug(generateUniqueSlug(title));

        String imgUrl = uploadImage(image);
        if (imgUrl != null) n.setImageUrl(imgUrl);

        if (finalStatus.equals("PUBLISHED")) {
            n.setPublishedAt(LocalDateTime.now());
        }

        return repo.save(n);
    }

    // =====================================
    // UPDATE NEWS
    // =====================================
    public News updateNews(Long id,
                           String title,
                           String category,
                           String subcategory,
                           String status,
                           String content,
                           MultipartFile image,
                           String authorName,
                           Boolean featured,
                           Boolean breaking) {

        News old = repo.findById(id).orElse(null);
        if (old == null) return null;

        if (title != null && !title.isBlank()) {
            old.setTitle(title);
            if (old.getSlug() == null || old.getSlug().isBlank()) {
                old.setSlug(generateUniqueSlug(title));
            }
        }

        if (category != null) old.setCategory(category);

        if (subcategory != null) old.setSubcategory(subcategory);

        if (content != null) {
            old.setContent(content);
            old.setSummary(buildSummary(content));
        }

        if (status != null) {
            String st = status.trim().toUpperCase(Locale.ROOT);
            old.setStatus(st);

            if (st.equals("PUBLISHED") && old.getPublishedAt() == null) {
                old.setPublishedAt(LocalDateTime.now());
            }
        }

        if (authorName != null) {
            Author a = old.getAuthor();
            if (a == null) a = new Author();

            a.setName(authorName.trim());
            old.setAuthor(a);
        }

        String imgUrl = uploadImage(image);
        if (imgUrl != null) old.setImageUrl(imgUrl);

        if (featured != null) old.setFeatured(featured);
        if (breaking != null) old.setBreaking(breaking);

        return repo.save(old);
    }

    // =====================================
    // CRUD
    // =====================================
    public List<News> getAll() {
        return repo.findAll();
    }

    public News getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public boolean delete(Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }

    // =====================================
    // PUBLIC APIs
    // =====================================
    public List<News> getLatestPublished(int limit) {
        return repo.findByStatusOrderByPublishedAtDesc("PUBLISHED",
                PageRequest.of(0, Math.max(1, limit)));
    }

    public List<News> getTrending(int limit) {
        return repo.findByStatusOrderByViewsDesc("PUBLISHED",
                PageRequest.of(0, Math.max(1, limit)));
    }

    public List<News> getFeatured() {
        return repo.findByFeaturedTrueOrderByPublishedAtDesc();
    }

    public List<News> getByCategory(String category) {
        return repo.findByCategoryIgnoreCaseOrderByPublishedAtDesc(category);
    }

    public News getBySlugAndIncreaseViews(String slug) {
        News news = repo.findBySlug(slug).orElse(null);
        if (news == null) return null;

        news.setViews(news.getViews() + 1);
        return repo.save(news);
    }

    // =====================================
    // HELPERS
    // =====================================
    private String buildSummary(String content) {
        if (content == null) return null;
        content = content.trim();
        return content.length() <= 180 ? content : content.substring(0, 177) + "...";
    }

    private String generateUniqueSlug(String input) {
        if (input == null) return null;

        String baseSlug = generateSlug(input);
        String slug = baseSlug;

        int counter = 1;
        while (repo.findBySlug(slug).isPresent()) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    private String generateSlug(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\w-]", "").toLowerCase(Locale.ROOT);
    }

    public News saveDirect(News news) {
        return repo.save(news);
    }
}
