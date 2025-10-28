package com.unibooks.library.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    
    @GetMapping(value = {
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/dashboard/**",
        "/librarian-dashboard",
        "/librarian-dashboard/**",
        "/admin-dashboard",
        "/admin-dashboard/**",
        "/session-test"
    })
    public String forward() {
        return "forward:/index.html";
    }
}
