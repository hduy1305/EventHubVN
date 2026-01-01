package com.example.notification_service;

import com.example.notification_service.dto.OrderPaidEvent;
import com.example.notification_service.dto.TicketTransferCompletedEvent;
import com.example.notification_service.dto.TicketTransferRequestedEvent;
import com.example.notification_service.dto.TicketSoldEvent;
import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private static final String ORDER_PAID_TOPIC = "order.paid";
    private static final String TICKET_TRANSFER_REQUESTED_TOPIC = "ticket.transfer.requested";
    private static final String TICKET_TRANSFER_COMPLETED_TOPIC = "ticket.transfer.completed";
    private static final String TICKET_SOLD_TOPIC = "ticket.sold";

    @Value("${notification.admin-email}")
    private String adminEmail;

    private final EmailService emailService;
    private final Gson gson = new Gson();

    @KafkaListener(topics = ORDER_PAID_TOPIC, groupId = "notification-group")
    public void listenOrderPaid(String message) {
        System.out.println("Received message from " + ORDER_PAID_TOPIC + ": " + message);
        OrderPaidEvent event = gson.fromJson(message, OrderPaidEvent.class);
        String subject = "Order Confirmation";
        String text = String.format("Dear user, your order with ID %d has been paid. Total amount: %s %s",
                event.getOrderId(), event.getTotalAmount(), event.getCurrency());
        emailService.sendEmail(event.getUserEmail(), subject, text);
    }

    @KafkaListener(topics = TICKET_TRANSFER_REQUESTED_TOPIC, groupId = "notification-group")
    public void listenTicketTransferRequested(String message) {
        System.out.println("Received message from " + TICKET_TRANSFER_REQUESTED_TOPIC + ": " + message);
        TicketTransferRequestedEvent event = gson.fromJson(message, TicketTransferRequestedEvent.class);
        String subject = "Ticket Transfer Request";
        String text = String.format("Dear admin, a ticket transfer has been requested for ticket %s from %s to %s. Transfer ID: %s",
                event.getTicketCode(), event.getSenderEmail(), event.getRecipientEmail(), event.getTransferId());
        emailService.sendEmail(adminEmail, subject, text);
    }

    @KafkaListener(topics = TICKET_TRANSFER_COMPLETED_TOPIC, groupId = "notification-group")
    public void listenTicketTransferCompleted(String message) {
        System.out.println("Received message from " + TICKET_TRANSFER_COMPLETED_TOPIC + ": " + message);
        TicketTransferCompletedEvent event = gson.fromJson(message, TicketTransferCompletedEvent.class);
        String subject = "Ticket Transfer Completed";
        String text = String.format("Dear user, the ticket %s has been successfully transferred to you from %s.",
                event.getTicketCode(), event.getSenderEmail());
        emailService.sendEmail(event.getRecipientEmail(), subject, text);
    }

    @KafkaListener(topics = TICKET_SOLD_TOPIC, groupId = "notification-group")
    public void listenTicketSold(String message) {
        System.out.println("Received message from " + TICKET_SOLD_TOPIC + ": " + message);
        TicketSoldEvent event = gson.fromJson(message, TicketSoldEvent.class);
        String subject = "Your ticket has been sold";
        String text = String.format("Ticket %s was purchased for %s by buyer %s.", event.getTicketCode(), event.getPrice(), event.getBuyerId());
        // Prefer seller email if provided; fall back to admin
        String recipient = (event.getSellerEmail() != null && !event.getSellerEmail().isEmpty()) ? event.getSellerEmail() : adminEmail;
        emailService.sendEmail(recipient, subject, text);
    }
}
