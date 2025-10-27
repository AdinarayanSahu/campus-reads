package com.unibooks.library.service;

import com.unibooks.library.dto.BorrowRequest;
import com.unibooks.library.dto.BorrowResponse;
import com.unibooks.library.dto.ReturnRequest;
import com.unibooks.library.model.Book;
import com.unibooks.library.model.BorrowRecord;
import com.unibooks.library.model.BorrowRecord.BorrowStatus;
import com.unibooks.library.model.User;
import com.unibooks.library.repository.BookRepository;
import com.unibooks.library.repository.BorrowRecordRepository;
import com.unibooks.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class BorrowService {

    @Autowired
    private BorrowRecordRepository borrowRecordRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    private static final int DEFAULT_BORROW_DAYS = 14;
    private static final int MAX_BOOKS_PER_USER = 5;
    private static final double FINE_PER_DAY = 10.0;

    @Transactional
    public BorrowResponse borrowBook(BorrowRequest request) {
        
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is not available for borrowing");
        }

        // Check if user has a pending request for this book
        var existingPendingRequest = borrowRecordRepository.findActiveBookBorrowByUser(
                user.getId(), book.getId(), BorrowStatus.PENDING);
        if (existingPendingRequest.isPresent()) {
            throw new RuntimeException("You already have a pending request for this book");
        }

        // Check if user already borrowed this book
        var existingBorrow = borrowRecordRepository.findActiveBookBorrowByUser(
                user.getId(), book.getId(), BorrowStatus.BORROWED);
        if (existingBorrow.isPresent()) {
            throw new RuntimeException("You have already borrowed this book");
        }

        // Count active borrows and pending requests
        long activeBorrows = borrowRecordRepository.countByUserIdAndStatus(
                user.getId(), BorrowStatus.BORROWED);
        long pendingRequests = borrowRecordRepository.countByUserIdAndStatus(
                user.getId(), BorrowStatus.PENDING);
        
        if (activeBorrows + pendingRequests >= MAX_BOOKS_PER_USER) {
            throw new RuntimeException("You have reached the maximum limit of " + MAX_BOOKS_PER_USER + " books (including pending requests)");
        }

        BorrowRecord borrowRecord = new BorrowRecord();
        borrowRecord.setUser(user);
        borrowRecord.setBook(book);
        borrowRecord.setBorrowDate(LocalDateTime.now());
        
        int days = DEFAULT_BORROW_DAYS;
        if (request.getBorrowDays() != null) {
            days = request.getBorrowDays();
        }
        borrowRecord.setDueDate(LocalDateTime.now().plusDays(days));
        borrowRecord.setStatus(BorrowStatus.PENDING); // Set as PENDING instead of BORROWED

        // Don't decrease available copies until approved
        BorrowRecord savedRecord = borrowRecordRepository.save(borrowRecord);

        return convertToResponse(savedRecord);
    }

    @Transactional
    public BorrowResponse approveBorrowRequest(Long borrowRecordId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        if (borrowRecord.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }

        Book book = borrowRecord.getBook();
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is no longer available");
        }

        // Approve the request
        borrowRecord.setStatus(BorrowStatus.BORROWED);
        borrowRecord.setApprovedDate(LocalDateTime.now());
        
        // Now decrease the available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord updatedRecord = borrowRecordRepository.save(borrowRecord);
        return convertToResponse(updatedRecord);
    }

    @Transactional
    public BorrowResponse rejectBorrowRequest(Long borrowRecordId, String reason) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("Borrow request not found"));

        if (borrowRecord.getStatus() != BorrowStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }

        borrowRecord.setStatus(BorrowStatus.REJECTED);
        borrowRecord.setRejectionReason(reason != null ? reason : "Request rejected by librarian");

        BorrowRecord updatedRecord = borrowRecordRepository.save(borrowRecord);
        return convertToResponse(updatedRecord);
    }

    @Transactional
    public BorrowResponse returnBook(ReturnRequest request) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(request.getBorrowRecordId())
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrowRecord.getStatus() == BorrowStatus.RETURNED) {
            throw new RuntimeException("Book has already been returned");
        }

        LocalDateTime returnDate = LocalDateTime.now();
        borrowRecord.setReturnDate(returnDate);

        if (returnDate.isAfter(borrowRecord.getDueDate())) {
            long daysOverdue = ChronoUnit.DAYS.between(borrowRecord.getDueDate(), returnDate);
            double fine = daysOverdue * FINE_PER_DAY;
            borrowRecord.setFineAmount(fine);
        }

        borrowRecord.setStatus(BorrowStatus.RETURNED);

        Book book = borrowRecord.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        BorrowRecord updatedRecord = borrowRecordRepository.save(borrowRecord);

        return convertToResponse(updatedRecord);
    }

    public List<BorrowResponse> getUserBorrowHistory(Long userId) {
        List<BorrowRecord> records = borrowRecordRepository.findByUserIdOrderByBorrowDateDesc(userId);
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getUserActiveBorrows(Long userId) {
        List<BorrowRecord> records = borrowRecordRepository.findByUserIdAndStatus(userId, BorrowStatus.BORROWED);

        for (BorrowRecord record : records) {
            checkIfOverdue(record);
        }
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getAllBorrowRecords() {
        List<BorrowRecord> records = borrowRecordRepository.findAll();

        for (BorrowRecord record : records) {
            checkIfOverdue(record);
        }
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getActiveBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByBorrowDateDesc(BorrowStatus.BORROWED);
        
        for (BorrowRecord record : records) {
            checkIfOverdue(record);
        }
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getPendingRequests() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByBorrowDateDesc(BorrowStatus.PENDING);
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getUserPendingRequests(Long userId) {
        List<BorrowRecord> records = borrowRecordRepository.findByUserIdAndStatus(userId, BorrowStatus.PENDING);
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public List<BorrowResponse> getOverdueBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusAndDueDateBefore(
                BorrowStatus.BORROWED, LocalDateTime.now());

        for (BorrowRecord record : records) {
            record.setStatus(BorrowStatus.OVERDUE);
            long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), LocalDateTime.now());
            record.setFineAmount(daysOverdue * FINE_PER_DAY);
            borrowRecordRepository.save(record);
        }
        
        List<BorrowResponse> responses = new ArrayList<>();
        for (BorrowRecord record : records) {
            responses.add(convertToResponse(record));
        }
        return responses;
    }

    public BorrowResponse getBorrowRecordById(Long id) {
        BorrowRecord record = borrowRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));
        
        checkIfOverdue(record);
        
        return convertToResponse(record);
    }

    @Transactional
    public BorrowResponse renewBook(Long borrowRecordId, Integer additionalDays) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new RuntimeException("Borrow record not found"));

        if (borrowRecord.getStatus() != BorrowStatus.BORROWED && borrowRecord.getStatus() != BorrowStatus.OVERDUE) {
            throw new RuntimeException("Only active borrows can be renewed");
        }

        int days = DEFAULT_BORROW_DAYS;
        if (additionalDays != null) {
            days = additionalDays;
        }
        borrowRecord.setDueDate(borrowRecord.getDueDate().plusDays(days));

        if (borrowRecord.getStatus() == BorrowStatus.OVERDUE) {
            borrowRecord.setStatus(BorrowStatus.BORROWED);
            borrowRecord.setFineAmount(0.0);
        }

        BorrowRecord updatedRecord = borrowRecordRepository.save(borrowRecord);
        return convertToResponse(updatedRecord);
    }

    private void checkIfOverdue(BorrowRecord record) {
        if (record.getStatus() == BorrowStatus.BORROWED && 
            LocalDateTime.now().isAfter(record.getDueDate())) {
            record.setStatus(BorrowStatus.OVERDUE);
            long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), LocalDateTime.now());
            record.setFineAmount(daysOverdue * FINE_PER_DAY);
            borrowRecordRepository.save(record);
        }
    }

    private BorrowResponse convertToResponse(BorrowRecord record) {
        BorrowResponse response = new BorrowResponse();
        response.setId(record.getId());
        response.setUserId(record.getUser().getId());
        response.setUserName(record.getUser().getName());
        response.setUserEmail(record.getUser().getEmail());
        response.setBookId(record.getBook().getId());
        response.setBookTitle(record.getBook().getTitle());
        response.setBookAuthor(record.getBook().getAuthor());
        response.setBookIsbn(record.getBook().getIsbn());
        response.setBorrowDate(record.getBorrowDate());
        response.setDueDate(record.getDueDate());
        response.setReturnDate(record.getReturnDate());
        response.setStatus(record.getStatus());
        response.setFineAmount(record.getFineAmount());

        LocalDateTime now = LocalDateTime.now();
        if (record.getReturnDate() == null) {
            if (now.isBefore(record.getDueDate())) {
                response.setIsOverdue(false);
                long daysUntilDue = ChronoUnit.DAYS.between(now, record.getDueDate());
                response.setDaysUntilDue(daysUntilDue);
                response.setDaysOverdue(0L);
            } else {
                response.setIsOverdue(true);
                response.setDaysUntilDue(0L);
                long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), now);
                response.setDaysOverdue(daysOverdue);
            }
        } else {
            response.setIsOverdue(false);
            response.setDaysUntilDue(0L);
            if (record.getReturnDate().isAfter(record.getDueDate())) {
                long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), record.getReturnDate());
                response.setDaysOverdue(daysOverdue);
            } else {
                response.setDaysOverdue(0L);
            }
        }

        return response;
    }
}
