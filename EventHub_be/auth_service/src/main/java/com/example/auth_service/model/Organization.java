package com.example.auth_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;
import java.util.UUID;

@Entity
@Table(name = "organizations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String contactEmail;

    @ManyToOne
    @JoinColumn(name = "owner_user_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User owner;

    @Enumerated(EnumType.STRING)
    private OrganizationStatus status;

    @Column(columnDefinition = "TEXT")
    private String cancellationPolicy; // New field for cancellation policy
    @Column(columnDefinition = "TEXT")
    private String refundPolicy;       // New field for refund policy
    private String supportedPaymentMethods; // New field for supported payment methods (e.g., comma-separated list)
    private String feesAndTaxes;       // New field for fees and taxes information

    @CreationTimestamp
    private Timestamp createdAt;

    @UpdateTimestamp
    private Timestamp updatedAt;
}
