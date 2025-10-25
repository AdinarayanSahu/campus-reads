package com.unibooks.library.service;

import com.unibooks.library.dto.BookRequest;
import com.unibooks.library.dto.BookResponse;
import com.unibooks.library.model.Book;
import com.unibooks.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    public BookResponse addBook(BookRequest request) {
        Optional<Book> existingBook = bookRepository.findByIsbn(request.getIsbn());
        if (existingBook.isPresent()) {
            throw new RuntimeException("Book with ISBN " + request.getIsbn() + " already exists");
        }
        
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        book.setTotalCopies(request.getTotalCopies());
        
        if (request.getAvailableCopies() != null) {
            book.setAvailableCopies(request.getAvailableCopies());
        } else {
            book.setAvailableCopies(request.getTotalCopies());
        }
        
        book.setCoverImage(request.getCoverImage());
        Book savedBook = bookRepository.save(book);
        return BookResponse.fromBook(savedBook);
    }
    
    public BookResponse updateBook(Long id, BookRequest request) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (!optionalBook.isPresent()) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        
        Book book = optionalBook.get();
        
        if (!book.getIsbn().equals(request.getIsbn())) {
            Optional<Book> existingBook = bookRepository.findByIsbn(request.getIsbn());
            if (existingBook.isPresent()) {
                throw new RuntimeException("Book with ISBN " + request.getIsbn() + " already exists");
            }
        }
        
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setIsbn(request.getIsbn());
        book.setCategory(request.getCategory());
        book.setTotalCopies(request.getTotalCopies());
        book.setAvailableCopies(request.getAvailableCopies());
        book.setCoverImage(request.getCoverImage());
        
        Book updatedBook = bookRepository.save(book);
        return BookResponse.fromBook(updatedBook);
    }
    
    public void deleteBook(Long id) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (!optionalBook.isPresent()) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        
        Book book = optionalBook.get();
        bookRepository.delete(book);
    }
    
    public BookResponse getBookById(Long id) {
        Optional<Book> optionalBook = bookRepository.findById(id);
        if (!optionalBook.isPresent()) {
            throw new RuntimeException("Book not found with id: " + id);
        }
        
        Book book = optionalBook.get();
        return BookResponse.fromBook(book);
    }
    
    public List<BookResponse> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        List<BookResponse> responseList = new ArrayList<>();
        
        for (Book book : books) {
            BookResponse response = BookResponse.fromBook(book);
            responseList.add(response);
        }
        
        return responseList;
    }
    
    public List<BookResponse> searchBooksByTitle(String title) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCase(title);
        List<BookResponse> responseList = new ArrayList<>();
        
        for (Book book : books) {
            BookResponse response = BookResponse.fromBook(book);
            responseList.add(response);
        }
        
        return responseList;
    }
    
    public List<BookResponse> searchBooksByAuthor(String author) {
        List<Book> books = bookRepository.findByAuthorContainingIgnoreCase(author);
        List<BookResponse> responseList = new ArrayList<>();
        
        for (Book book : books) {
            BookResponse response = BookResponse.fromBook(book);
            responseList.add(response);
        }
        
        return responseList;
    }
    
    public List<BookResponse> getBooksByCategory(String category) {
        List<Book> books = bookRepository.findByCategory(category);
        List<BookResponse> responseList = new ArrayList<>();
        
        for (Book book : books) {
            BookResponse response = BookResponse.fromBook(book);
            responseList.add(response);
        }
        
        return responseList;
    }
}
