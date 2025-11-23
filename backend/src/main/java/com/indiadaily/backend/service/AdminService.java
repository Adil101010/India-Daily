package com.indiadaily.backend.service;

import com.indiadaily.backend.model.Admin;
import com.indiadaily.backend.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository repo;

    public AdminService(AdminRepository repo) {
        this.repo = repo;
    }

    public Admin login(String email, String password) {
        Admin admin = repo.findByEmail(email);
        if (admin == null || !admin.getPassword().equals(password)) {
            return null;
        }
        return admin;
    }

    // CREATE
    public Admin addAdmin(Admin admin) {
        return repo.save(admin);
    }

    // READ ALL
    public List<Admin> getAllAdmins() {
        return repo.findAll();
    }

    // READ SINGLE
    public Admin getAdminById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // UPDATE
    public Admin updateAdmin(Long id, Admin updated) {
        Admin admin = repo.findById(id).orElse(null);

        if (admin == null) return null;

        admin.setName(updated.getName());
        admin.setEmail(updated.getEmail());
        admin.setPassword(updated.getPassword());

        return repo.save(admin);
    }

    // DELETE
    public boolean deleteAdmin(Long id) {
        if (!repo.existsById(id)) return false;

        repo.deleteById(id);
        return true;
    }
}
