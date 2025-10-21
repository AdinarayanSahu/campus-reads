package com.unibooks.library.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String gender;
    private String password;
    private String confirmPassword;
}
