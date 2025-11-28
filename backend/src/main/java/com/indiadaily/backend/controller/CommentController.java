package com.indiadaily.backend.controller;

import com.indiadaily.backend.entity.Comment;
import com.indiadaily.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // Get all approved comments for one article
    @GetMapping("/news/{newsId}")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long newsId) {
        List<Comment> comments =
                commentRepository.findByNewsIdAndApprovedTrueOrderByCreatedAtDesc(newsId);
        return ResponseEntity.ok(comments);
    }

    // Get comment count
    @GetMapping("/count/{newsId}")
    public ResponseEntity<Map<String, Long>> getCommentCount(@PathVariable Long newsId) {
        Long count = commentRepository.countByNewsIdAndApprovedTrue(newsId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // Add new comment (public)
    @PostMapping("/add")
    public ResponseEntity<?> addComment(@RequestBody Comment comment) {

        if (comment.getNewsId() == null ||
                comment.getUserName() == null ||
                comment.getEmail() == null ||
                comment.getContent() == null) {
            return ResponseEntity.badRequest().body("All fields are required!");
        }

        if (comment.getContent().trim().isEmpty() ||
                comment.getContent().length() < 10) {
            return ResponseEntity.badRequest().body("Comment must be at least 10 characters!");
        }

        comment.setApproved(true); // auto-approve for now

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }
}
