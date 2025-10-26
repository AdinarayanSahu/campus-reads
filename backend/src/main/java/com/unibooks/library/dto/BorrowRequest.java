package com.unibooks.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BorrowRequest {
    private Long userId;
    private Long bookId;
    private Integer borrowDays;
}
