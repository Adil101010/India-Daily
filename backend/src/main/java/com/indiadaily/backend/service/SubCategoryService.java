package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.model.SubCategory;
import com.indiadaily.backend.repository.CategoryRepository;
import com.indiadaily.backend.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;        // ✅ ADD THIS
import java.util.HashMap;    // ✅ ADD THIS
@Service
public class SubCategoryService {

    private final SubCategoryRepository subRepo;
    private final CategoryRepository catRepo;

    public SubCategoryService(SubCategoryRepository subRepo, CategoryRepository catRepo) {
        this.subRepo = subRepo;
        this.catRepo = catRepo;
    }

    // Create subcategory
    public SubCategory create(String name, Long categoryId) {
        Category category = catRepo.findById(categoryId).orElse(null);
        if (category == null) return null;

        SubCategory sub = new SubCategory();
        sub.setName(name);
        sub.setSlug(generateSlug(name));
        sub.setCategory(category);

        return subRepo.save(sub);
    }

    // Get by category
    public List<SubCategory> listByCategory(Long categoryId) {
        Category category = catRepo.findById(categoryId).orElse(null);
        if (category == null) return List.of();

        return subRepo.findByCategory(category);
    }

    // All subcategories
    public List<SubCategory> all() {
        return subRepo.findAll();
    }

    // Delete
    public boolean delete(Long id) {
        if (!subRepo.existsById(id)) return false;
        subRepo.deleteById(id);
        return true;
    }

    // Update
    public SubCategory update(Long id, String name, Long categoryId) {
        SubCategory old = subRepo.findById(id).orElse(null);
        if (old == null) return null;

        if (name != null) {
            old.setName(name);
            old.setSlug(generateSlug(name));
        }

        if (categoryId != null) {
            Category category = catRepo.findById(categoryId).orElse(null);
            if (category != null) old.setCategory(category);
        }

        return subRepo.save(old);
    }

    private String generateSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        // Hindi to English mapping for subcategories
        Map<String, String> hindiToEnglish = new HashMap<>();

        // Politics
        hindiToEnglish.put("राष्ट्रीय", "national");
        hindiToEnglish.put("अंतर्राष्ट्रीय", "international");
        hindiToEnglish.put("चुनाव", "election");

        // Sports
        hindiToEnglish.put("क्रिकेट", "cricket");
        hindiToEnglish.put("फुटबॉल", "football");
        hindiToEnglish.put("ओलंपिक", "olympics");
        hindiToEnglish.put("अन्य खेल", "other-sports");

        // Business
        hindiToEnglish.put("बाजार", "market");
        hindiToEnglish.put("कंपनियां", "companies");
        hindiToEnglish.put("नीति", "policy");

        // Entertainment
        hindiToEnglish.put("बॉलीवुड", "bollywood");
        hindiToEnglish.put("हॉलीवुड", "hollywood");
        hindiToEnglish.put("टीवी", "tv");
        hindiToEnglish.put("संगीत", "music");

        // Technology
        hindiToEnglish.put("मोबाइल", "mobile");
        hindiToEnglish.put("AI और तकनीक", "ai-tech");
        hindiToEnglish.put("गैजेट्स", "gadgets");

        // World News
        hindiToEnglish.put("एशिया", "asia");
        hindiToEnglish.put("यूरोप", "europe");
        hindiToEnglish.put("अमेरिका", "america");

        if (hindiToEnglish.containsKey(input.trim())) {
            return hindiToEnglish.get(input.trim());
        }

        // Fallback
        String slug = input.toLowerCase()
                .trim()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "");

        return slug.isEmpty() ? "subcategory-" + System.currentTimeMillis() : slug;
    }

}
