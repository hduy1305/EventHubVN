import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Grid, Card, CardContent, Button, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Box, CircularProgress, Typography, Alert, Stack, Tooltip } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import { TicketsService } from '../api/services/TicketsService';
import { UsersService } from '../api/services/UsersService';
import type { Event } from '../api/models/Event';
import type { CheckInLogDto } from '../api/models/CheckInLogDto';
import type { TicketResponse } from '../api/models/TicketResponse';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './CheckInPage.css';

type BarcodeDetectorType = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: {
      new(init?: { formats: string[] }): BarcodeDetectorType;
    };
  }
}

const CheckInPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);
  const isOrganizer = user?.roles?.some(r => (r as any).authority === 'ROLE_ORGANIZER') || false;
  const isAdmin = user?.roles?.some(r => (r as any).authority === 'ROLE_ADMIN') || false;

  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [eventShowtimes, setEventShowtimes] = useState<any[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  const [ticketCodeInput, setTicketCodeInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const html5ScannerRef = useRef<Html5QrcodeScanner | null>(null);

  const [checkInLogs, setCheckInLogs] = useState<CheckInLogDto[]>([]);
  const [attendeeTickets, setAttendeeTickets] = useState<TicketResponse[]>([]);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user?.id) {
      showNotification('User not authenticated.', 'error');
      setLoading(false);
      return;
    }
    fetchManagedEvents();
  }, [user, showNotification]);

  useEffect(() => {
    if (selectedEventId) {
      const event = availableEvents.find(e => e.id === parseInt(selectedEventId));
      setCurrentEvent(event || null);
      if (event) {
        fetchEventShowtimes(event.id!);
        fetchEventData(event.id!);
      }
    } else {
      setCurrentEvent(null);
      setEventShowtimes([]);
      setSelectedShowtimeId('');
      setCheckInLogs([]);
      setAttendeeTickets([]);
    }
  }, [selectedEventId, availableEvents]);

  const fetchEventShowtimes = async (eventId: number) => {
    try {
      const ticketsWithShowtimes = await EventsService.getApiEventsTicketsWithShowtimes(eventId);
      // Extract unique showtimes from all ticket types
      const showtimesMap = new Map();
      ticketsWithShowtimes.forEach(ticket => {
        ticket.showtimes?.forEach((st: any) => {
          if (!showtimesMap.has(st.showtimeId)) {
            showtimesMap.set(st.showtimeId, {
              id: st.showtimeId,
              showtimeCode: st.showtimeCode,
              startTime: st.startTime,
              endTime: st.endTime
            });
          }
        });
      });
      const showtimes = Array.from(showtimesMap.values());
      console.log('Fetched showtimes:', showtimes);
      setEventShowtimes(showtimes);
      if (showtimes.length === 1) {
        setSelectedShowtimeId(showtimes[0].id?.toString() || '');
      }
    } catch (err: any) {
      console.error('Failed to fetch showtimes:', err);
      setEventShowtimes([]);
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId: number | null = null;

    const startScanner = async () => {
      setScannerError(null);
      
      // Try native BarcodeDetector first (Chrome, Edge)
      if (window.BarcodeDetector) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const scanLoop = async () => {
            if (!isScanning || !videoRef.current) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0) {
                const value = codes[0].rawValue;
                setTicketCodeInput(value);
                showNotification('QR detected, code filled.', 'success');
                setIsScanning(false);
                return;
              }
            } catch (err) {
              console.error('Scan error', err);
            }
            rafId = requestAnimationFrame(scanLoop);
          };
          scanLoop();
          return;
        } catch (err: any) {
          console.error('BarcodeDetector failed, falling back to html5-qrcode:', err);
          // Fall through to html5-qrcode
        }
      }

      // Fallback to html5-qrcode for Firefox, Safari, etc.
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-scanner-container',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        
        html5ScannerRef.current = scanner;
        scanner.render(
          (decodedText) => {
            setTicketCodeInput(decodedText);
            showNotification('QR detected, code filled.', 'success');
            setIsScanning(false);
            scanner.clear();
          },
          () => {
            // Ignore decode errors
          }
        );
      } catch (err: any) {
        console.error('Scanner start failed', err);
        setScannerError(err.message || 'Unable to start QR scanner.');
        setIsScanning(false);
      }
    };

    if (isScanning) {
      startScanner();
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (html5ScannerRef.current) {
        html5ScannerRef.current.clear().catch(console.error);
      }
    };
  }, [isScanning, showNotification]);

  const fetchManagedEvents = async () => {
    setLoading(true);
    try {
      const response = await EventsService.getApiEventsSearch(undefined, undefined, undefined, undefined, undefined, undefined, 'PUBLISHED', undefined, 0, 100);
      const allEvents = response.content || [];
      const published = allEvents.filter(event => event.status === 'PUBLISHED');
      
      let visibleEvents: Event[] = [];
      
      if (isAdmin) {
        // Admin sees all published events
        visibleEvents = published;
      } else if (isOrganizer) {
        // Organizer sees only their own events
        visibleEvents = published.filter(event => event.organizerId === user?.id);
      } else {
        // Staff sees only events assigned to them
        const assignedEventIds = await UsersService.getApiUsersAssignedEvents(user?.id || '');
        visibleEvents = published.filter(event => assignedEventIds.includes(event.id || 0));
      }
      
      setAvailableEvents(visibleEvents);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách sự kiện');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const getCheckInWindow = (event: Event, showtimeId?: string) => {
    // If showtimes exist and one is selected, use showtime's time
    if (eventShowtimes.length > 0 && showtimeId) {
      const showtime = eventShowtimes.find(st => st.id === Number(showtimeId));
      if (showtime?.startTime && showtime?.endTime) {
        const start = new Date(showtime.startTime);
        const end = new Date(showtime.endTime);
        const windowStart = new Date(start.getTime() - 60 * 60 * 1000); // 1 hour before
        return { windowStart, start, end };
      }
    }
    // Fallback to event time if no showtime
    if (!event.startTime || !event.endTime) {
      return null;
    }
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const windowStart = new Date(start.getTime() - 60 * 60 * 1000); // 1 hour before
    return { windowStart, start, end };
  };

  const checkInWindow = React.useMemo(() => {
    if (!currentEvent) return null;
    // Wait for showtimes to load if event has multiple showtimes
    if (eventShowtimes.length === 0 && selectedEventId) {
      console.log('Waiting for showtimes to load...');
      return null;
    }
    return getCheckInWindow(currentEvent, selectedShowtimeId);
  }, [currentEvent, selectedShowtimeId, eventShowtimes, selectedEventId]);
  const isCheckInActive = !!checkInWindow && now >= checkInWindow.windowStart && now <= checkInWindow.end;
  const isCheckInEnded = !!checkInWindow && now > checkInWindow.end;
  const showCheckInTooltip = isCheckInActive;
  const showCountdown = !!checkInWindow && now < checkInWindow.windowStart;

  const formatCountdown = (target: Date) => {
    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchEventData = useCallback(async (eventId: number) => {
    setLoading(true);
    try {
      const logs = await TicketsService.getApiTicketsEventCheckInLogs(eventId);
      setCheckInLogs(logs);

      const tickets = await TicketsService.getApiTicketsEvent(eventId);
      setAttendeeTickets(tickets);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải thông tin sự kiện');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Failed to fetch event data:", err);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Filter tickets and logs by selected showtime
  // NOTE: Currently TicketResponse doesn't include showtimeCode field
  // Filter tickets by selected showtime if applicable
  const filteredTickets = React.useMemo(() => {
    if (!selectedShowtimeId || eventShowtimes.length === 0) {
      // No showtime filter - show all tickets
      return attendeeTickets;
    }
    
    // Find the selected showtime to get its code
    const selectedShowtime = eventShowtimes.find(st => st.id === Number(selectedShowtimeId));
    if (!selectedShowtime?.showtimeCode) {
      return attendeeTickets;
    }
    
    // Filter tickets by showtime code
    return attendeeTickets.filter(ticket => ticket.showtimeCode === selectedShowtime.showtimeCode);
  }, [attendeeTickets, selectedShowtimeId, eventShowtimes]);

  const filteredLogs = React.useMemo(() => {
    if (!selectedShowtimeId || eventShowtimes.length === 0) {
      return checkInLogs;
    }
    
    // Get ticket codes for the filtered showtime
    const filteredTicketCodes = new Set(filteredTickets.map(t => t.ticketCode));
    
    // Filter logs to only show check-ins for tickets in the selected showtime
    return checkInLogs.filter(log => filteredTicketCodes.has(log.ticket?.ticketCode || ''));
  }, [checkInLogs, filteredTickets, selectedShowtimeId, eventShowtimes]);

  const handleTicketScan = async (ticketCode: string, isRescan: boolean = false) => {
    if (!selectedEventId || !ticketCode) {
      showNotification('Please select an event and enter a ticket code.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const scannedTicket = await TicketsService.postApiTicketsScan(ticketCode, `Gate ${selectedEventId}-A`, `Device-${user?.id}`, user?.id);
      showNotification(`Ticket ${scannedTicket.ticketCode} for ${scannedTicket.attendeeName} checked in successfully!`, 'success');
      if (!isRescan) { // Only clear input if it was a manual entry scan
        setTicketCodeInput('');
      }
      fetchEventData(parseInt(selectedEventId));
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể thực hiện check-in');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Check-in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async (ticketCode: string) => {
    if (!selectedEventId) {
      showNotification('Please select an event first.', 'warning');
      return;
    }

    if (!window.confirm(`Manually check in ticket ${ticketCode}?`)) {
      return;
    }

    setLoading(true);
    try {
      const scannedTicket = await TicketsService.postApiTicketsScan(ticketCode, `Manual Gate ${selectedEventId}`, `Device-${user?.id}`, user?.id);
      showNotification(`Ticket ${scannedTicket.ticketCode} for ${scannedTicket.attendeeName} manually checked in successfully!`, 'success');
      fetchEventData(parseInt(selectedEventId));
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể thực hiện check-in thủ công');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      console.error("Manual check-in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportAttendees = () => {
    if (!currentEvent) {
      showNotification('Please select an event first.', 'warning');
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Ticket Code,Attendee Name,Attendee Email,Status,Check-in Time\n"
      + attendeeTickets.map(t => 
          `${t.ticketCode},${t.attendeeName},${t.attendeeEmail},${t.status},${checkInLogs.find(log => log.ticket?.ticketCode === t.ticketCode)?.checkInTime || ''}`
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendees_${currentEvent.name?.replace(/\s/g, '_')}_${selectedEventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showNotification('Attendee list exported!', 'success');
  };

  if (loading && !currentEvent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>Check-in Operations</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isAdmin && <Chip label="Admin Access" color="error" size="small" />}
          {isOrganizer && <Chip label="Organizer Access" color="primary" size="small" />}
          {!isAdmin && !isOrganizer && <Chip label="Staff Access" color="success" size="small" />}
        </Box>
      </Box>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <TextField
                label="Event Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <TextField
                select
                label="Select Event"
                fullWidth
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                helperText="Pick an event after choosing date to lock check-in window"
              >
                <MenuItem value="">-- Select an Event --</MenuItem>
                {availableEvents
                  .filter(event => {
                    if (!selectedDate || !event.startTime) return true;
                    return event.startTime.startsWith(selectedDate);
                  })
                  .map(event => (
                    <MenuItem key={event.id} value={event.id}>
                      {event.name} ({new Date(event.startTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                    </MenuItem>
                  ))}
              </TextField>
            </Stack>
            {eventShowtimes.length > 0 && selectedEventId && (
              <TextField
                select
                label={eventShowtimes.length > 1 ? "Select Showtime *" : "Showtime"}
                fullWidth
                value={selectedShowtimeId}
                onChange={(e) => {
                  console.log('Showtime selected:', e.target.value);
                  setSelectedShowtimeId(e.target.value);
                }}
                helperText={eventShowtimes.length > 1 ? "This event has multiple showtimes - select one for check-in" : "This event has one showtime"}
                required={eventShowtimes.length > 1}
                disabled={eventShowtimes.length === 1}
              >
                {eventShowtimes.length > 1 && <MenuItem value="">-- Select a Showtime --</MenuItem>}
                {eventShowtimes.map(showtime => (
                  <MenuItem key={showtime.id} value={showtime.id}>
                    {showtime.showtimeCode} - {new Date(showtime.startTime).toLocaleString()} to {new Date(showtime.endTime).toLocaleTimeString()}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </CardContent>
      </Card>

      {currentEvent && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Check-in for {currentEvent.name}</Typography>
                {eventShowtimes.length > 1 && !selectedShowtimeId && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Please select a showtime above to enable check-in
                  </Alert>
                )}
                {checkInWindow && (() => {
                  const selectedST = eventShowtimes.find(st => st.id === Number(selectedShowtimeId));
                  return (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Window opens 1 hour before start and closes at end time. 
                      {eventShowtimes.length > 1 && selectedShowtimeId && selectedST ? (
                        <><br/>Showtime: {new Date(selectedST.startTime).toLocaleString()}</>
                      ) : (
                        <><br/>Start: {new Date(checkInWindow.start).toLocaleString()}</>
                      )}
                    </Typography>
                  );
                })()}
                {showCountdown && checkInWindow && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Check-in opens in {formatCountdown(checkInWindow.windowStart)}
                  </Typography>
                )}
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleTicketScan(ticketCodeInput); }} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Enter Ticket Code (or scan QR)"
                    value={ticketCodeInput}
                    onChange={(e) => setTicketCodeInput(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
                    <Tooltip title={showCheckInTooltip ? 'Check-in is available' : ''} disableHoverListener={!showCheckInTooltip}>
                      <span>
                        <Button
                          variant={isScanning ? 'outlined' : 'contained'}
                          color="secondary"
                          startIcon={<QrCodeScannerIcon />}
                          onClick={() => setIsScanning(!isScanning)}
                          disabled={!isCheckInActive || isCheckInEnded}
                        >
                          {isScanning ? 'Stop scanning' : 'Scan QR'}
                        </Button>
                      </span>
                    </Tooltip>
                    {scannerError && <Typography color="error" variant="body2">{scannerError}</Typography>}
                  </Stack>
                  {isScanning && (
                    <Box sx={{ mb: 2 }}>
                      <video ref={videoRef} style={{ width: '100%', maxHeight: 240, borderRadius: 8, display: 'none' }} muted playsInline />
                      <div id="qr-scanner-container" style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }} />
                    </Box>
                  )}
                  <Tooltip title={showCheckInTooltip ? 'Check-in is available' : ''} disableHoverListener={!showCheckInTooltip}>
                    <span>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading || !isCheckInActive || isCheckInEnded}
                        startIcon={<QrCodeScannerIcon />}
                        size="large"
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Scan / Check-in'}
                      </Button>
                    </span>
                  </Tooltip>
                </Box>
                <Button variant="outlined" fullWidth onClick={handleExportAttendees} startIcon={<HistoryIcon />}>
                  Export Attendee List (CSV)
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Check-in History</Typography>
                {filteredLogs.length === 0 ? (
                  <Alert severity="info">No check-in logs available for this event yet.</Alert>
                ) : (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Ticket Code</TableCell>
                          <TableCell>Time</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLogs.map(log => (
                          <TableRow key={log.id}>
                            <TableCell>{log.ticket?.ticketCode}</TableCell>
                            <TableCell>{log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleTicketScan(log.ticket?.ticketCode || '', true)}
                                disabled={loading || !isCheckInActive || isCheckInEnded}
                                startIcon={<RefreshIcon />}
                              >
                                Scan Again
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {currentEvent && (
        <>
          <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mt: 4 }}>All Event Tickets</Typography>
          {eventShowtimes.length > 1 && selectedShowtimeId && (() => {
            const st = eventShowtimes.find(s => s.id === Number(selectedShowtimeId));
            return (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing tickets for showtime: <strong>{st?.showtimeCode}</strong> ({filteredTickets.length} tickets)
              </Typography>
            );
          })()}
          {filteredTickets.length === 0 ? (
            <Alert severity="info">No tickets sold for this event yet.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket Code</TableCell>
                    <TableCell>Attendee Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTickets.map(ticket => {
                    const log = filteredLogs.find(l => l.ticket?.ticketCode === ticket.ticketCode);
                    const isCheckedIn = ticket.status === 'SCANNED';
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.ticketCode}</TableCell>
                        <TableCell>{ticket.attendeeName}</TableCell>
                        <TableCell>{ticket.attendeeEmail}</TableCell>
                        <TableCell>
                          <Chip 
                            label={isCheckedIn ? 'Checked In' : 'Pending'}
                            color={isCheckedIn ? 'success' : 'default'}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{log?.checkInTime ? new Date(log.checkInTime).toLocaleString() : '-'}</TableCell>
                        <TableCell>
                          {!isCheckedIn && (
                            <Tooltip title={showCheckInTooltip ? 'Check-in is available' : ''} disableHoverListener={!showCheckInTooltip}>
                              <span>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleManualCheckIn(ticket.ticketCode!)}
                                  disabled={loading || !isCheckInActive || isCheckInEnded}
                                >
                                  Manual
                                </Button>
                              </span>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default CheckInPage;
