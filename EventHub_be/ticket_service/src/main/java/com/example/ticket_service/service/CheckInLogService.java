package com.example.ticket_service.service;

import com.example.ticket_service.model.CheckInLog;
import com.example.ticket_service.repository.CheckInLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckInLogService {
    private final CheckInLogRepository checkInLogRepository;

    public CheckInLog save(CheckInLog log) {
        return checkInLogRepository.save(log);
    }

    public List<CheckInLog> findByEvent(Long eventId) {
        return checkInLogRepository.findByEventId(eventId);
    }

    public List<CheckInLog> findByTicket(Long ticketId) {
        return checkInLogRepository.findByTicketId(ticketId);
    }

    public List<CheckInLog> findByUser(String userId) {
        return checkInLogRepository.findByUserId(userId);
    }
}
