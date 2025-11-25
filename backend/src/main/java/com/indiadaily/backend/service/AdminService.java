package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Admin;
import com.indiadaily.backend.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository repo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ===========================
    // LOGIN (JWT Ready)
    // ===========================
    public Admin login(String email, String rawPassword) {

        Admin admin = repo.findByEmail(email);

        if (admin == null) {
            return null;
        }

        // CHECK HASHED PASSWORD
        if (!passwordEncoder.matches(rawPassword, admin.getPassword())) {
            return null;
        }

        return admin;   // controller token generate karega
    }

    // ===========================
    // CREATE
    // ===========================
    public Admin addAdmin(Admin admin) {

        // HASH the password before saving
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));

        return repo.save(admin);
    }

    // ===========================
    // READ ALL
    // ===========================
    public List<Admin> getAllAdmins() {
        return repo.findAll();
    }

    // ===========================
    // READ SINGLE
    // ===========================
    public Admin getAdminById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // ===========================
    // UPDATE
    // ===========================
    public Admin updateAdmin(Long id, Admin updated) {

        Admin admin = repo.findById(id).orElse(null);
        if (admin == null) return null;

        admin.setName(updated.getName());
        admin.setEmail(updated.getEmail());

        // If new password provided → hash it
        if (updated.getPassword() != null && !updated.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(updated.getPassword()));
        }

        admin.setRole(updated.getRole());

        return repo.save(admin);
    }

    // ===========================
    // DELETE
    // ===========================
    public boolean deleteAdmin(Long id) {
        if (!repo.existsById(id)) return false;

        repo.deleteById(id);
        return true;
    }
}
