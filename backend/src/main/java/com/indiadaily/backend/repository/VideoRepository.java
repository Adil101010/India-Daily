package com.indiadaily.backend.repository;

import com.indiadaily.backend.model.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    List<Video> findTop4ByOrderByCreatedAtDesc();
}
