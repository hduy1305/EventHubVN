import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { TicketResponse } from '../api/models/TicketResponse';
import type { Event } from '../api/models/Event';

export const generateTicketPDF = async (ticket: TicketResponse, event: Event | null) => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = '#2563eb'; // Royal Blue from theme
  const secondaryColor = '#1e293b'; // Slate 800

  // Header Background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('EventHub', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Event Ticket', 105, 30, { align: 'center' });

  // Event Details
  doc.setTextColor(secondaryColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(event?.name || 'Event Name', 20, 60);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(event?.venue?.name || 'Venue', 20, 70);
  doc.text(`${event?.venue?.address || ''}, ${event?.venue?.city || ''}`, 20, 76);
  
  if (event?.startTime) {
      doc.text(`Start: ${new Date(event.startTime).toLocaleString()}`, 20, 85);
  }

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 95, 190, 95);

  // Attendee Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Attendee:', 20, 110);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.attendeeName || 'N/A', 60, 110);

  doc.setFont('helvetica', 'bold');
  doc.text('Ticket Code:', 20, 120);
  doc.setFont('helvetica', 'normal');
  doc.text(ticket.ticketCode || 'N/A', 60, 120);

  if (ticket.seatId) {
      doc.setFont('helvetica', 'bold');
      doc.text('Seat ID:', 20, 130);
      doc.setFont('helvetica', 'normal');
      doc.text(ticket.seatId.toString(), 60, 130);
  }

  // QR Code
  try {
    if (ticket.ticketCode) {
        const qrDataUrl = await QRCode.toDataURL(ticket.ticketCode, { width: 150 });
        doc.addImage(qrDataUrl, 'PNG', 130, 100, 60, 60);
    }
  } catch (err) {
    console.error('Error generating QR code', err);
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Please present this ticket at the entrance.', 105, 280, { align: 'center' });

  // Save
  doc.save(`ticket_${ticket.ticketCode}.pdf`);
};
