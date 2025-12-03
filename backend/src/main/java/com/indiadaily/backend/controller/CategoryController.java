package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.Category;
import com.indiadaily.backend.service.CategoryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

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
    // ========== PUBLIC: MEGA MENU TOP 9 CATEGORIES ==========
    @GetMapping("/public/category/mega-menu")
    public ResponseEntity<?> getMegaMenuData() {
        try {
            List<Category> topCategories = service.getTop9CategoriesWithSubCategories();
            return ResponseEntity.ok(topCategories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching mega menu data");
        }
    }

}
