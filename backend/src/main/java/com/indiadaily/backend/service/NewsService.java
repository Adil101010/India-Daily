package com.indiadaily.backend.service;

import com.indiadaily.backend.model.News;
import com.indiadaily.backend.repository.NewsRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class NewsService {

    private final NewsRepository repo;

    public NewsService(NewsRepository repo) {
        this.repo = repo;
    }

    // IMAGE UPLOAD COMMON FUNCTION
    private String uploadImage(MultipartFile image) {
        try {
            if (image != null && !image.isEmpty()) {
                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String originalName = image.getOriginalFilename();
                if (originalName == null) {
                    originalName = "image";
                }

                String fileName = System.currentTimeMillis() + "_" + originalName.replaceAll("\\s+", "_");
                Path filePath = Paths.get(uploadDir + fileName);
                Files.write(filePath, image.getBytes());

                // TODO: base URL ko config se read kar sakte ho, abhi localhost ke liye
                return "http://localhost:8080/" + uploadDir + fileName;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // ADD NEWS
    public News addNews(String title,
                        String category,
                        String author,
                        String status,
                        String content,
                        MultipartFile image) {

        News n = new News();

        // basic fields
        n.setTitle(title != null ? title.trim() : null);
        n.setCategory(category != null ? category.trim() : null);
        n.setAuthor(author != null ? author.trim() : null);

        // status normalize (Published/Draft)
        String finalStatus = (status == null || status.isBlank())
                ? "DRAFT"
                : status.trim().toUpperCase(Locale.ROOT);
        n.setStatus(finalStatus);

        // long content
        n.setContent(content);

        // summary (listing ke liye short text)
        n.setSummary(buildSummary(content));

        // slug (SEO URL) – title se generate
        if (title != null && !title.isBlank()) {
            String slug = generateSlug(title);
            n.setSlug(slug);
        }

        // flags default
        n.setFeatured(false);
        n.setBreaking(false);

        // image upload (optional)
        String imgUrl = uploadImage(image);
        if (imgUrl != null) {
            n.setImageUrl(imgUrl);
        }

        // views default 0 entity me already set hai

        return repo.save(n);
    }

    // UPDATE WITH OPTIONAL IMAGE
    public News updateNews(Long id,
                           String title,
                           String category,
                           String status,
                           String content,
                           MultipartFile image) {

        News old = repo.findById(id).orElse(null);
        if (old == null) return null;

        if (title != null && !title.isBlank()) {
            old.setTitle(title.trim());
            // agar pehle slug null tha to ab generate kar do
            if (old.getSlug() == null || old.getSlug().isBlank()) {
                old.setSlug(generateSlug(title));
            }
        }

        if (category != null && !category.isBlank()) {
            old.setCategory(category.trim());
        }

        if (status != null && !status.isBlank()) {
            String finalStatus = status.trim().toUpperCase(Locale.ROOT);
            old.setStatus(finalStatus);
        }

        if (content != null && !content.isBlank()) {
            old.setContent(content);
            // summary bhi update kar sakte hain
            old.setSummary(buildSummary(content));
        }

        // image optional – sirf nayi aayi to hi update
        String imgUrl = uploadImage(image);
        if (imgUrl != null) {
            old.setImageUrl(imgUrl);
        }

        return repo.save(old);
    }

    // OTHERS – ADMIN SIDE
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

    // ================================
    // PUBLIC SIDE METHODS (frontend k liye)
    // ================================

    // Latest news (home page) – max 10, ya limit jitna mile
    public List<News> getLatestPublished(int limit) {
        List<News> list = repo.findTop10ByStatusOrderByPublishedAtDesc("PUBLISHED");
        if (limit <= 0 || limit >= list.size()) {
            return list;
        }
        return list.subList(0, limit);
    }

    // Trending news – views ke basis par
    public List<News> getTrending(int limit) {
        List<News> list = repo.findTop5ByStatusOrderByViewsDesc("PUBLISHED");
        if (limit <= 0 || limit >= list.size()) {
            return list;
        }
        return list.subList(0, limit);
    }

    // Featured stories – home hero section
    public List<News> getFeatured() {
        return repo.findByFeaturedTrueOrderByPublishedAtDesc();
    }

    // Category wise listing (abhi simple String category)
    public List<News> getByCategory(String category) {
        if (category == null || category.isBlank()) {
            return List.of();
        }
        return repo.findByCategoryOrderByPublishedAtDesc(category.trim());
    }

    // Article page – slug se fetch + views++
    public News getBySlugAndIncreaseViews(String slug) {
        if (slug == null || slug.isBlank()) {
            return null;
        }
        News news = repo.findBySlug(slug.trim()).orElse(null);
        if (news == null) return null;

        news.setViews(news.getViews() + 1);
        return repo.save(news);
    }

    // === helpers ===

    private String buildSummary(String content) {
        if (content == null) return null;
        String trimmed = content.trim();
        if (trimmed.length() <= 180) {
            return trimmed;
        }
        return trimmed.substring(0, 177) + "...";
    }

    private String generateSlug(String input) {
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\w-]", "").toLowerCase(Locale.ROOT);
        return slug;
    }
}
