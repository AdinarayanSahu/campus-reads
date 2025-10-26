package com.unibooks.library.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
@Data
public class BorrowRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;
    
    @Column(nullable = false)
    private LocalDateTime borrowDate;
    
    @Column(nullable = false)
    private LocalDateTime dueDate;
    
    @Column
    private LocalDateTime returnDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status = BorrowStatus.BORROWED;
    
    @Column
    private Double fineAmount = 0.0;
    
    public enum BorrowStatus {
        BORROWED,
        RETURNED,
        OVERDUE,
        LOST
    }
}
