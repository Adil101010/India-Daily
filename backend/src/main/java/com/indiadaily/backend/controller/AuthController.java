package com.indiadaily.backend.controller;

import com.indiadaily.backend.dto.LoginRequest;
import com.indiadaily.backend.model.Admin;
import com.indiadaily.backend.service.AdminService;
import com.indiadaily.backend.config.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // CREATE ADMIN (NO TOKEN REQUIRED)
    @PostMapping("/create")
    public Admin createAdmin(@RequestBody Admin admin) {
        return adminService.addAdmin(admin);
    }

    // LOGIN (NO TOKEN REQUIRED)
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        Admin admin = adminService.login(request.getEmail(), request.getPassword());
        if (admin == null) return "INVALID";
        return jwtUtil.generateToken(admin.getEmail());
    }

    // TEST TOKEN (TOKEN REQUIRED)
    @GetMapping("/test")
    public String test() {
        return "Token Verified Successfully!";
    }

    //---------------------------
    // CRUD — (TOKEN REQUIRED)
    //---------------------------

    @PostMapping("/add")
    public Admin add(@RequestBody Admin admin) {
        return adminService.addAdmin(admin);
    }

    @GetMapping("/all")
    public List<Admin> allAdmins() {
        return adminService.getAllAdmins();
    }

    @GetMapping("/{id}")
    public Admin getById(@PathVariable Long id) {
        return adminService.getAdminById(id);
    }

    @PutMapping("/{id}")
    public Admin update(@PathVariable Long id, @RequestBody Admin admin) {
        return adminService.updateAdmin(id, admin);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return adminService.deleteAdmin(id) ? "DELETED" : "NOT FOUND";
    }
}
