package com.indiadaily.backend.controller;

import com.indiadaily.backend.dto.LoginRequest;
import com.indiadaily.backend.model.Admin;
import com.indiadaily.backend.service.AdminService;
import com.indiadaily.backend.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AuthController {

    private final AdminService adminService;
    private final JwtUtil jwtUtil;

    public AuthController(AdminService adminService, JwtUtil jwtUtil) {
        this.adminService = adminService;
        this.jwtUtil = jwtUtil;
    }

    // ============================
    // CREATE ADMIN (Public)
    // ============================
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin) {
        Admin saved = adminService.addAdmin(admin);

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Admin created successfully");
        res.put("admin", saved);

        return ResponseEntity.ok(res);
    }

    // ============================
    // LOGIN (Public)
    // ============================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        Admin admin = adminService.login(request.getEmail(), request.getPassword());

        if (admin == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid email or password");
            return ResponseEntity.status(401).body(error);
        }

        // Generate token
        String token = jwtUtil.generateToken(admin.getEmail());

        Map<String, Object> res = new HashMap<>();
        res.put("token", token);
        res.put("admin", admin);

        return ResponseEntity.ok(res);
    }

    // ============================
    // TEST TOKEN (Protected)
    // ============================
    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok("Token Verified Successfully!");
    }

    // ============================
    // CRUD (Protected)
    // ============================

    @PostMapping("/add")
    public ResponseEntity<?> add(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.addAdmin(admin));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Admin>> allAdmins() {
        return ResponseEntity.ok(adminService.getAllAdmins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        Admin admin = adminService.getAdminById(id);
        if (admin == null)
            return ResponseEntity.status(404).body("Admin not found");
        return ResponseEntity.ok(admin);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Admin updated) {
        Admin admin = adminService.updateAdmin(id, updated);
        if (admin == null)
            return ResponseEntity.status(404).body("Admin not found");
        return ResponseEntity.ok(admin);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean deleted = adminService.deleteAdmin(id);
        if (!deleted)
            return ResponseEntity.status(404).body("NOT FOUND");
        return ResponseEntity.ok("DELETED");
    }
}
