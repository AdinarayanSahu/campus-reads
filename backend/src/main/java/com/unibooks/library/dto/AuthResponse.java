package com.unibooks.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String message;
    private Long userId;
    private String name;
    private String email;
    private String gender;
    private String role;
    private String token;
}
