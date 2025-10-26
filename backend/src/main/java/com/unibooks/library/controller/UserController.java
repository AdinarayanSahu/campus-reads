package com.unibooks.library.controller;

import com.unibooks.library.model.User;
import com.unibooks.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();

        users.forEach(user -> user.setPassword(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> userData) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(userData.get("email")).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }

            User newUser = new User();
            newUser.setName(userData.get("name"));
            newUser.setEmail(userData.get("email"));
            newUser.setGender(userData.get("gender"));
            newUser.setPassword(passwordEncoder.encode(userData.get("password")));
            newUser.setRole(User.Role.USER);

            User savedUser = userRepository.save(newUser);
            savedUser.setPassword(null);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to register user: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN', 'USER')")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setPassword(null);
                    return ResponseEntity.ok(user);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return userRepository.findById(id)
                .map(user -> {
                    if (updates.containsKey("name")) {
                        user.setName((String) updates.get("name"));
                    }
                    if (updates.containsKey("email")) {
                        String newEmail = (String) updates.get("email");
                        if (userRepository.findByEmail(newEmail).isPresent() && 
                            !userRepository.findByEmail(newEmail).get().getId().equals(id)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
                        }
                        user.setEmail(newEmail);
                    }
                    if (updates.containsKey("gender")) {
                        user.setGender((String) updates.get("gender"));
                    }
                    if (updates.containsKey("role")) {
                        user.setRole(User.Role.valueOf((String) updates.get("role")));
                    }
                    if (updates.containsKey("password") && updates.get("password") != null && 
                        !((String) updates.get("password")).isEmpty()) {
                        user.setPassword(passwordEncoder.encode((String) updates.get("password")));
                    }
                    
                    User savedUser = userRepository.save(user);
                    savedUser.setPassword(null);
                    return ResponseEntity.ok(savedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Long> getUserCount() {
        return ResponseEntity.ok(userRepository.count());
    }
}
