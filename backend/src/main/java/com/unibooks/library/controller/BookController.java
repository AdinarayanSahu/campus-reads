package com.unibooks.library.controller;

import com.unibooks.library.dto.BookRequest;
import com.unibooks.library.dto.BookResponse;
import com.unibooks.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {
    
    @Autowired
    private BookService bookService;
    
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> addBook(@RequestBody BookRequest request) {
        try {
            BookResponse response = bookService.addBook(request);
            ResponseEntity<?> result = ResponseEntity.status(HttpStatus.CREATED).body(response);
            return result;
        } catch (Exception e) {
            String errorMessage = "Error adding book: " + e.getMessage();
            ResponseEntity<?> errorResponse = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
            return errorResponse;
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody BookRequest request) {
        try {
            BookResponse response = bookService.updateBook(id, request);
            ResponseEntity<?> result = ResponseEntity.ok(response);
            return result;
        } catch (Exception e) {
            String errorMessage = "Error updating book: " + e.getMessage();
            ResponseEntity<?> errorResponse = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
            return errorResponse;
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            String successMessage = "Book deleted successfully";
            ResponseEntity<?> result = ResponseEntity.ok(successMessage);
            return result;
        } catch (Exception e) {
            String errorMessage = "Error deleting book: " + e.getMessage();
            ResponseEntity<?> errorResponse = ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorMessage);
            return errorResponse;
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            BookResponse response = bookService.getBookById(id);
            ResponseEntity<?> result = ResponseEntity.ok(response);
            return result;
        } catch (Exception e) {
            String errorMessage = "Book not found: " + e.getMessage();
            ResponseEntity<?> errorResponse = ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
            return errorResponse;
        }
    }
    
    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks() {
        List<BookResponse> books = bookService.getAllBooks();
        ResponseEntity<List<BookResponse>> result = ResponseEntity.ok(books);
        return result;
    }
    
    @GetMapping("/search/title")
    public ResponseEntity<List<BookResponse>> searchByTitle(@RequestParam String title) {
        List<BookResponse> books = bookService.searchBooksByTitle(title);
        ResponseEntity<List<BookResponse>> result = ResponseEntity.ok(books);
        return result;
    }
    
    @GetMapping("/search/author")
    public ResponseEntity<List<BookResponse>> searchByAuthor(@RequestParam String author) {
        List<BookResponse> books = bookService.searchBooksByAuthor(author);
        ResponseEntity<List<BookResponse>> result = ResponseEntity.ok(books);
        return result;
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<BookResponse>> getBooksByCategory(@PathVariable String category) {
        List<BookResponse> books = bookService.getBooksByCategory(category);
        ResponseEntity<List<BookResponse>> result = ResponseEntity.ok(books);
        return result;
    }
}
