package com.indiadaily.backend.repository;

import com.indiadaily.backend.model.SubCategory;
import com.indiadaily.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {

    List<SubCategory> findByCategory(Category category);

    Optional<SubCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
