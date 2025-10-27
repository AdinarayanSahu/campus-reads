package com.unibooks.library.controller;

import com.unibooks.library.dto.BorrowRequest;
import com.unibooks.library.dto.BorrowResponse;
import com.unibooks.library.dto.ReturnRequest;
import com.unibooks.library.service.BorrowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrows")
@CrossOrigin(origins = "*")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    @PostMapping("/borrow")
    public ResponseEntity<?> borrowBook(@RequestBody BorrowRequest request) {
        try {
            BorrowResponse response = borrowService.borrowBook(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/return")
    public ResponseEntity<?> returnBook(@RequestBody ReturnRequest request) {
        try {
            BorrowResponse response = borrowService.returnBook(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/renew/{borrowRecordId}")
    public ResponseEntity<?> renewBook(@PathVariable Long borrowRecordId, @RequestParam(required = false) Integer additionalDays) {
        try {
            BorrowResponse response = borrowService.renewBook(borrowRecordId, additionalDays);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BorrowResponse>> getUserBorrowHistory(@PathVariable Long userId) {
        List<BorrowResponse> history = borrowService.getUserBorrowHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<BorrowResponse>> getUserActiveBorrows(@PathVariable Long userId) {
        List<BorrowResponse> activeBorrows = borrowService.getUserActiveBorrows(userId);
        return ResponseEntity.ok(activeBorrows);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getAllBorrowRecords() {
        List<BorrowResponse> records = borrowService.getAllBorrowRecords();
        return ResponseEntity.ok(records);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getActiveBorrows() {
        List<BorrowResponse> activeBorrows = borrowService.getActiveBorrows();
        return ResponseEntity.ok(activeBorrows);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getOverdueBorrows() {
        List<BorrowResponse> overdueBorrows = borrowService.getOverdueBorrows();
        return ResponseEntity.ok(overdueBorrows);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowResponse>> getPendingRequests() {
        List<BorrowResponse> pendingRequests = borrowService.getPendingRequests();
        return ResponseEntity.ok(pendingRequests);
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<List<BorrowResponse>> getUserPendingRequests(@PathVariable Long userId) {
        List<BorrowResponse> pendingRequests = borrowService.getUserPendingRequests(userId);
        return ResponseEntity.ok(pendingRequests);
    }

    @PostMapping("/approve/{borrowRecordId}")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> approveBorrowRequest(@PathVariable Long borrowRecordId) {
        try {
            BorrowResponse response = borrowService.approveBorrowRequest(borrowRecordId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/reject/{borrowRecordId}")
    @PreAuthorize("hasAnyAuthority('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<?> rejectBorrowRequest(
            @PathVariable Long borrowRecordId,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String reason = body != null ? body.get("reason") : null;
            BorrowResponse response = borrowService.rejectBorrowRequest(borrowRecordId, reason);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBorrowRecordById(@PathVariable Long id) {
        try {
            BorrowResponse response = borrowService.getBorrowRecordById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
