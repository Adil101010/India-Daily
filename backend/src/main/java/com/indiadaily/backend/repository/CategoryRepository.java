package com.indiadaily.backend.repository;

import com.indiadaily.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);
    // NEW: mega menu ke liye latest 10
    List<Category> findTop10ByOrderByIdDesc();

}
