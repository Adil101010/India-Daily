package com.indiadaily.backend.controller;

import com.indiadaily.backend.model.SubCategory;
import com.indiadaily.backend.service.SubCategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SubCategoryController {

    private final SubCategoryService service;

    public SubCategoryController(SubCategoryService service) {
        this.service = service;
    }

    // ========== ADMIN: ADD SUBCATEGORY ==========
    @PostMapping("/admin/subcategory/add")
    public SubCategory addSubCategory(
            @RequestParam String name,
            @RequestParam Long categoryId
    ) {
        return service.create(name, categoryId);
    }

    // ========== PUBLIC: ALL SUBCATEGORIES ==========
    @GetMapping("/public/subcategory/all")
    public List<SubCategory> all() {
        return service.all();
    }

    // ========== PUBLIC: LIST BY CATEGORY ==========
    @GetMapping("/public/subcategory/by-category/{catId}")
    public List<SubCategory> byCategory(@PathVariable Long catId) {
        return service.listByCategory(catId);
    }

    // ========== ADMIN: UPDATE SUBCATEGORY ==========
    @PutMapping("/admin/subcategory/update/{id}")
    public SubCategory update(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId
    ) {
        return service.update(id, name, categoryId);
    }

    // ========== ADMIN: DELETE ==========
    @DeleteMapping("/admin/subcategory/delete/{id}")
    public String delete(@PathVariable Long id) {
        boolean ok = service.delete(id);
        return ok ? "Deleted" : "Not Found";
    }
}
