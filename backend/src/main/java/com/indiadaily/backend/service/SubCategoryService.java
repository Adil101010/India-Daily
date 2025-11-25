package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.model.SubCategory;
import com.indiadaily.backend.repository.CategoryRepository;
import com.indiadaily.backend.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

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
        if (input == null) return null;
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\w-]", "").toLowerCase(Locale.ROOT);
    }
}
