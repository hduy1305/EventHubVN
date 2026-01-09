package com.example.auth_service.repository;

import com.example.auth_service.model.StaffEventAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffEventAssignmentRepository extends JpaRepository<StaffEventAssignment, Long> {
    List<StaffEventAssignment> findByStaffId(UUID staffId);
    
    Optional<StaffEventAssignment> findByStaffIdAndEventId(UUID staffId, Long eventId);
    
    @Modifying
    @Transactional
    void deleteByStaffIdAndEventId(UUID staffId, Long eventId);
}
