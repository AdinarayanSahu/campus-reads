package com.unibooks.library.controller;

import com.unibooks.library.dto.AuthResponse;
import com.unibooks.library.dto.LoginRequest;
import com.unibooks.library.dto.RegisterRequest;
import com.unibooks.library.model.User;
import com.unibooks.library.service.AuthService;
import com.unibooks.library.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            AuthResponse response = new AuthResponse(
                "Registration successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getRole().name(),
                token
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponse(e.getMessage(), null, null, null, null, null, null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            User user = authService.login(request);
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            AuthResponse response = new AuthResponse(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getRole().name(),
                token
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(e.getMessage(), null, null, null, null, null, null));
        }
    }
    
}
