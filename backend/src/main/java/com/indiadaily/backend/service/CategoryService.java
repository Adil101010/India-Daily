package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;        // ✅ ADD THIS
import java.util.HashMap;    // ✅ ADD THIS


@Service
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {

        this.repo = repo;
    }

    // Create category
    public Category create(String name) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(generateSlug(name));
        return repo.save(c);
    }

    // Get all
    public List<Category> all() {

        return repo.findAll();
    }

    // Get by slug
    public Category getBySlug(String slug) {

        return repo.findBySlug(slug).orElse(null);
    }

    // Delete
    public boolean delete(Long id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }

    // Update
    public Category update(Long id, String name) {
        Category c = repo.findById(id).orElse(null);
        if (c == null) return null;

        c.setName(name);
        c.setSlug(generateSlug(name));
        return repo.save(c);
    }
    // Get Top 9 categories for Mega Menu
    // Mega menu ke liye top 10 categories
    public List<Category> getTop10ForMegaMenu() {
        return repo.findTop10ByOrderByIdDesc();
    }



    private String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        // Hindi to English mapping (manual)
        Map<String, String> hindiToEnglish = new HashMap<>();
        hindiToEnglish.put("ट्रेंडिंग और वायरल", "trending-viral");
        hindiToEnglish.put("राजनीति", "politics");
        hindiToEnglish.put("खेल", "sports");
        hindiToEnglish.put("व्यापार और अर्थव्यवस्था", "business-economy");
        hindiToEnglish.put("मनोरंजन", "entertainment");
        hindiToEnglish.put("तकनीक", "technology");
        hindiToEnglish.put("अपराध", "crime");
        hindiToEnglish.put("विश्व समाचार", "world-news");
        hindiToEnglish.put("तथ्य जाँच", "fact-check");

        // Check if Hindi name exists in map
        if (hindiToEnglish.containsKey(input.trim())) {
            return hindiToEnglish.get(input.trim());
        }

        // Fallback: transliterate or simple conversion
        String slug = input.toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "");

        return slug.isEmpty() ? "category-" + System.currentTimeMillis() : slug;
    }

}
