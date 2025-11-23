package com.example.event_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Discount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;                // Mã giảm giá (unique per event)
    private Integer discountPercent;    // Phần trăm giảm
    private Integer usageLimit;         // Số lượt sử dụng tối đa
    private Integer usedCount;          // Số lượt đã dùng

    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
}

