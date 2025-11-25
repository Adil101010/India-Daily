package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    // ========== ADMIN: ADD CATEGORY ==========
    @PostMapping("/admin/category/add")
    public Category addCategory(@RequestParam String name) {
        return service.create(name);
    }

    // ========== PUBLIC: ALL CATEGORIES ==========
    @GetMapping("/public/category/all")
    public List<Category> getAll() {
        return service.all();
    }

    // ========== PUBLIC: GET BY SLUG ==========
    @GetMapping("/public/category/{slug}")
    public Category getBySlug(@PathVariable String slug) {
        return service.getBySlug(slug);
    }

    // ========== ADMIN: UPDATE ==========
    @PutMapping("/admin/category/update/{id}")
    public Category update(@PathVariable Long id, @RequestParam String name) {
        return service.update(id, name);
    }

    // ========== ADMIN: DELETE ==========
    @DeleteMapping("/admin/category/delete/{id}")
    public String delete(@PathVariable Long id) {
        boolean ok = service.delete(id);
        return ok ? "Deleted" : "Not Found";
    }
}
