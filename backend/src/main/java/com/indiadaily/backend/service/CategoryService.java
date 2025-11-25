package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

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

    private String generateSlug(String input) {
        if (input == null) return null;
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        return normalized.replaceAll("[^\\w-]", "").toLowerCase(Locale.ROOT);
    }
}
