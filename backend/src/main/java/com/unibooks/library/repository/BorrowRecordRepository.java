package com.unibooks.library.repository;

import com.unibooks.library.model.BorrowRecord;
import com.unibooks.library.model.BorrowRecord.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    
    List<BorrowRecord> findByUserIdOrderByBorrowDateDesc(Long userId);
    
    List<BorrowRecord> findByBookIdOrderByBorrowDateDesc(Long bookId);
    
    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowStatus status);
    
    List<BorrowRecord> findByBookIdAndStatus(Long bookId, BorrowStatus status);
    
    List<BorrowRecord> findByStatusAndDueDateBefore(BorrowStatus status, LocalDateTime date);

    @Query("SELECT br FROM BorrowRecord br WHERE br.user.id = :userId AND br.book.id = :bookId AND br.status = :status")
    Optional<BorrowRecord> findActiveBookBorrowByUser(@Param("userId") Long userId, @Param("bookId") Long bookId, @Param("status") BorrowStatus status);

    long countByUserIdAndStatus(Long userId, BorrowStatus status);
    
    List<BorrowRecord> findByStatusOrderByBorrowDateDesc(BorrowStatus status);
    
    List<BorrowRecord> findByFineAmountGreaterThan(Double amount);
}
