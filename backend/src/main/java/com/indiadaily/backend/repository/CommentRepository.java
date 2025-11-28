package com.indiadaily.backend.repository;

import com.indiadaily.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Approved comments for article
    List<Comment> findByNewsIdAndApprovedTrueOrderByCreatedAtDesc(Long newsId);

    // All comments for article (admin)
    List<Comment> findByNewsIdOrderByCreatedAtDesc(Long newsId);

    // Count approved comments
    Long countByNewsIdAndApprovedTrue(Long newsId);
}
