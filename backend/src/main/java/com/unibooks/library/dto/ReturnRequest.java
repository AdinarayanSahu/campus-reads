package com.unibooks.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReturnRequest {
    private Long borrowRecordId;
    private Boolean reportDamage;
}
