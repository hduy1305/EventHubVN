import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EventsService } from '../api/services/EventsService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import {
  EventWizardProvider,
  useEventWizard,
} from '../context/EventWizardContext';
import type {
  WizardTicketDetail,
  WizardTicketType,
  WizardShowtime,
} from '../context/EventWizardContext';

const categories = ['Music', 'Sports', 'Conference', 'Exhibition', 'Workshop', 'Online'];
const vietnamProvinces = [
  'Ha Noi',
  'Ho Chi Minh',
  'Da Nang',
  'Hai Phong',
  'Can Tho',
  'An Giang',
  'Binh Duong',
  'Dong Nai',
  'Khanh Hoa',
  'Thanh Hoa',
  'Thua Thien Hue',
];

const steps = [
  'Event Basic Information',
  'Organizer Information',
  'Showtimes & Ticket Configuration',
  'Ticket Creation & Mapping',
  'Payment & Invoice Information',
  'Review & Submit',
];

const EventWizardInner: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { state, dispatch } = useEventWizard();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [termsAndConditions, setTermsAndConditions] = useState<string>(() => {
    // Initialize with localStorage value immediately
    console.log('=== WIZARD INIT START ===');
    console.log('All localStorage keys:', Object.keys(localStorage));
    const saved = localStorage.getItem('eventhub_terms_and_conditions');
    console.log('INIT: Retrieved from localStorage:', saved ? `${saved.length} chars` : 'null');
    console.log('=== WIZARD INIT END ===');
    return saved || 'No terms and conditions configured yet. Admin must configure them first.';
  });

  // Fetch terms and conditions from localStorage (set by admin)
  // Listen for storage changes (when admin saves terms in another tab or returns to this tab)
  React.useEffect(() => {
    console.log('EFFECT: Setting up storage listener');
    
    const handleStorageChange = (e: StorageEvent) => {
      console.log('EFFECT: Storage event detected. Key:', e.key);
      if (e.key === 'eventhub_terms_and_conditions') {
        const newValue = e.newValue || 'No terms and conditions configured yet. Admin must configure them first.';
        console.log('EFFECT: Updating terms to:', newValue);
        setTermsAndConditions(newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage when component mounts in case it was updated in the same tab
    const currentValue = localStorage.getItem('eventhub_terms_and_conditions');
    if (currentValue) {
      console.log('EFFECT: Found terms in storage on mount:', currentValue);
      setTermsAndConditions(currentValue);
    }
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch event data for editing
  React.useEffect(() => {
    if (id) {
      setLoading(true);
      EventsService.getApiEvents1(parseInt(id))
        .then((event: any) => {
          dispatch({ type: 'SET_EVENT_ID', payload: event.id });
          dispatch({ type: 'SET_STATUS', payload: event.status });
          
          dispatch({
            type: 'UPDATE_BASIC_INFO',
            payload: {
              eventCode: event.eventCode,
              name: event.name,
              category: event.category,
              description: event.description,
              logoUrl: event.logoUrl,
              bannerUrl: event.bannerUrl,
            },
          });

          if (event.venue) {
            dispatch({
              type: 'UPDATE_VENUE',
              payload: {
                name: event.venue.name,
                province: event.venue.province,
                district: event.venue.district,
                ward: event.venue.ward,
                streetAddress: event.venue.streetAddress,
              },
            });
          }

          if (event.organizerInfo) {
            dispatch({
              type: 'UPDATE_ORGANIZER_INFO',
              payload: {
                organizerCode: event.organizerInfo.organizerCode,
                organizerName: event.organizerInfo.organizerName,
                logoUrl: event.organizerInfo.logoUrl,
                description: event.organizerInfo.description,
                termsAgreed: event.organizerInfo.termsAgreed,
                accountStatus: event.organizerInfo.accountStatus,
              },
            });
          }

          if (event.showtimes) {
            const showtimes = event.showtimes.map((s: any) => ({
              code: s.code,
              startTime: s.startTime,
              endTime: s.endTime,
            }));
            dispatch({ type: 'SET_SHOWTIMES', payload: showtimes });

            // Flatten allocations
            const allocations: any[] = [];
            event.showtimes.forEach((s: any) => {
              if (s.allocations) {
                s.allocations.forEach((a: any) => {
                  allocations.push({
                    showtimeCode: s.code,
                    ticketTypeCode: a.ticketType?.code, // Assuming ticketType is populated
                    quantity: a.quantity,
                  });
                });
              }
            });
            dispatch({ type: 'SET_ALLOCATIONS', payload: allocations });
          }

          if (event.ticketTypes) {
            const ticketTypes = event.ticketTypes.map((t: any) => ({
              code: t.code,
              name: t.name,
              price: t.price,
              maxQuantity: t.quota, // Map quota to maxQuantity
              saleStart: t.startSale,
              saleEnd: t.endSale,
              description: t.description,
            }));
            dispatch({ type: 'SET_TICKET_TYPES', payload: ticketTypes });
          }

          if (event.ticketZones) {
            const ticketDetails = event.ticketZones.map((z: any) => ({
              code: z.code,
              zoneName: z.name,
              ticketTypeCode: z.ticketType?.code,
              checkInTime: z.checkInTime,
            }));
            dispatch({ type: 'SET_TICKET_DETAILS', payload: ticketDetails });
          }

          if (event.customUrl) {
            dispatch({ type: 'UPDATE_SETTINGS', payload: { customUrl: event.customUrl, privacy: event.privacy } });
          }
          
          if (event.payoutInfo) {
             dispatch({ type: 'UPDATE_PAYOUT', payload: {
                accountHolderName: event.payoutInfo.accountHolderName,
                bankNumber: event.payoutInfo.bankNumber,
                bankName: event.payoutInfo.bankName
             }});
          }
          
          if (event.invoiceInfo) {
             dispatch({ type: 'UPDATE_INVOICE', payload: {
                enabled: event.invoiceInfo.enabled,
                companyName: event.invoiceInfo.companyName,
                taxCode: event.invoiceInfo.taxCode,
                address: event.invoiceInfo.address
             }});
          }

        })
        .catch(err => {
          const errorData = getErrorMessage(err, 'Không thể tải sự kiện');
          showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, dispatch, showNotification]);

  React.useEffect(() => {
    if (!id && !state.basicInfo.eventCode) {
      const code = `EVT-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      dispatch({ type: 'UPDATE_BASIC_INFO', payload: { eventCode: code } });
    }
    if (!id && user?.id && !state.organizerInfo.organizerCode) {
      dispatch({ type: 'SET_ORGANIZER_ID', payload: user.id });
      const suffix = user.id.replace(/-/g, '').slice(0, 6).toUpperCase();
      dispatch({ type: 'UPDATE_ORGANIZER_INFO', payload: { organizerCode: `ORG-${suffix}` } });
    }
    // Đảm bảo category luôn có giá trị hợp lệ
    if (!id && (!state.basicInfo.category || !categories.includes(state.basicInfo.category))) {
      dispatch({ type: 'UPDATE_BASIC_INFO', payload: { category: categories[0] } });
    }
  }, [dispatch, state.basicInfo.eventCode, state.organizerInfo.organizerCode, state.basicInfo.category, user?.id, id]);

  const isOnline = state.basicInfo.category.toLowerCase() === 'online';

  const handleFileUpload = (file: File, field: 'logoUrl' | 'bannerUrl' | 'organizerLogo') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (field === 'logoUrl') {
        dispatch({ type: 'UPDATE_BASIC_INFO', payload: { logoUrl: result } });
      } else if (field === 'bannerUrl') {
        dispatch({ type: 'UPDATE_BASIC_INFO', payload: { bannerUrl: result } });
      } else {
        dispatch({ type: 'UPDATE_ORGANIZER_INFO', payload: { logoUrl: result } });
      }
    };
    reader.readAsDataURL(file);
  };

  const createShowtime = (): WizardShowtime => ({
    code: `ST-${String(state.showtimes.length + 1).padStart(3, '0')}`,
    startTime: '',
    endTime: '',
  });

  const createTicketType = (): WizardTicketType => ({
    code: `TT-${String(state.ticketTypes.length + 1).padStart(3, '0')}`,
    name: '',
    price: 0,
    maxQuantity: 0,
    saleStart: '',
    saleEnd: '',
    description: '',
  });

  const createTicketDetail = (): WizardTicketDetail => ({
    code: `TK-${String(state.ticketDetails.length + 1).padStart(3, '0')}`,
    zoneName: '',
    ticketTypeCode: '',
    checkInTime: '',
  });

  const updateAllocation = (showtimeCode: string, ticketTypeCode: string, quantity: number) => {
    const next = [...state.allocations];
    const existingIndex = next.findIndex(
      allocation => allocation.showtimeCode === showtimeCode && allocation.ticketTypeCode === ticketTypeCode
    );
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], quantity };
    } else {
      next.push({ showtimeCode, ticketTypeCode, quantity });
    }
    dispatch({ type: 'SET_ALLOCATIONS', payload: next });
  };

  const getAllocationValue = (showtimeCode: string, ticketTypeCode: string) => {
    const allocation = state.allocations.find(
      item => item.showtimeCode === showtimeCode && item.ticketTypeCode === ticketTypeCode
    );
    return allocation?.quantity ?? 0;
  };

  const buildPayload = () => ({
    eventId: state.eventId,
    organizerId: state.organizerId,
    eventCode: state.basicInfo.eventCode,
    name: state.basicInfo.name,
    category: state.basicInfo.category,
    description: state.basicInfo.description,
    logoUrl: state.basicInfo.logoUrl,
    bannerUrl: state.basicInfo.bannerUrl,
    venue: isOnline
      ? null
      : {
          name: state.basicInfo.venue.name,
          province: state.basicInfo.venue.province,
          district: state.basicInfo.venue.district,
          ward: state.basicInfo.venue.ward,
          streetAddress: state.basicInfo.venue.streetAddress,
        },
    organizer: {
      organizerCode: state.organizerInfo.organizerCode,
      organizerName: state.organizerInfo.organizerName,
      logoUrl: state.organizerInfo.logoUrl,
      description: state.organizerInfo.description,
      termsAgreed: state.organizerInfo.termsAgreed,
      accountStatus: state.organizerInfo.accountStatus,
    },
    showtimes: state.showtimes.map(showtime => ({
      code: showtime.code,
      startTime: showtime.startTime ? `${showtime.startTime}:00` : '',
      endTime: showtime.endTime ? `${showtime.endTime}:00` : '',
    })),
    ticketTypes: state.ticketTypes.map(type => ({
      code: type.code,
      name: type.name,
      price: type.price,
      maxQuantity: type.maxQuantity,
      saleStart: type.saleStart,
      saleEnd: type.saleEnd,
      description: type.description,
    })),
    ticketDetails: state.ticketDetails.map(detail => ({
      code: detail.code,
      zoneName: detail.zoneName,
      ticketTypeCode: detail.ticketTypeCode,
      checkInTime: detail.checkInTime,
    })),
    allocations: state.allocations.map(allocation => ({
      showtimeCode: allocation.showtimeCode,
      ticketTypeCode: allocation.ticketTypeCode,
      quantity: allocation.quantity,
    })),
    settings: {
      customUrl: state.settings.customUrl,
      privacy: state.settings.privacy,
    },
    payout: {
      accountHolderName: state.payoutInfo.accountHolderName,
      bankNumber: state.payoutInfo.bankNumber,
      bankName: state.payoutInfo.bankName,
    },
    invoice: {
      enabled: state.invoiceInfo.enabled,
      companyName: state.invoiceInfo.companyName,
      taxCode: state.invoiceInfo.taxCode,
      address: state.invoiceInfo.address,
    },
  });

  const validateStep = async (stepIndex: number) => {
    if (stepIndex === 0) {
      if (!state.basicInfo.name.trim() || !state.basicInfo.category) {
        showNotification('Event name and category are required.', 'error');
        return false;
      }
      if (!isOnline) {
        const { name, province, district, ward, streetAddress } = state.basicInfo.venue;
        if (!name || !province || !district || !ward || !streetAddress) {
          showNotification('Complete all location fields for offline events.', 'error');
          return false;
        }
      }
    }
    if (stepIndex === 1) {
      if (!state.organizerInfo.organizerName.trim()) {
        showNotification('Organizer name is required.', 'error');
        return false;
      }
      if (!state.organizerInfo.termsAgreed) {
        showNotification('You must accept the terms agreement.', 'error');
        return false;
      }
    }
    if (stepIndex === 2) {
      if (state.showtimes.length === 0) {
        showNotification('Add at least one showtime.', 'error');
        return false;
      }
      if (state.ticketTypes.length === 0) {
        showNotification('Add at least one ticket type.', 'error');
        return false;
      }
      for (const showtime of state.showtimes) {
        if (!showtime.startTime || !showtime.endTime || showtime.startTime >= showtime.endTime) {
          showNotification('Each showtime must have valid start and end time.', 'error');
          return false;
        }
      }
      for (const type of state.ticketTypes) {
        if (!type.name.trim() || type.price <= 0 || type.maxQuantity <= 0) {
          showNotification('Ticket types require name, price, and max quantity.', 'error');
          return false;
        }
      }
    }
    if (stepIndex === 3) {
      if (state.ticketDetails.length === 0) {
        showNotification('Add at least one ticket detail.', 'error');
        return false;
      }
      for (const detail of state.ticketDetails) {
        if (!detail.zoneName.trim() || !detail.ticketTypeCode) {
          showNotification('Ticket details require zone name and ticket type.', 'error');
          return false;
        }
      }
      const hasAllocation = state.allocations.some(allocation => allocation.quantity > 0);
      if (!hasAllocation) {
        showNotification('Allocate quantities for ticket types per showtime.', 'error');
        return false;
      }
    }
    if (stepIndex === 4) {
      // Payment & Invoice Information validation
      if (!state.payoutInfo.accountHolderName.trim() || !state.payoutInfo.bankNumber.trim() || !state.payoutInfo.bankName.trim()) {
        showNotification('All payout information (account holder, bank number, bank name) is required.', 'error');
        return false;
      }
      if (state.invoiceInfo.enabled) {
        if (!state.invoiceInfo.companyName.trim() || !state.invoiceInfo.taxCode.trim() || !state.invoiceInfo.address.trim()) {
          showNotification('All invoice information is required when invoices are enabled.', 'error');
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(activeStep);
    if (!valid) return;
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => setActiveStep(prev => prev - 1);

  const saveDraft = async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const saved = await EventsService.postApiEventsDraft(payload);
      dispatch({ type: 'SET_EVENT_ID', payload: saved.id });
      dispatch({ type: 'SET_STATUS', payload: saved.status });
      showNotification('Draft saved successfully.', 'success');
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể lưu nháp');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const submitEvent = async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const saved = await EventsService.postApiEventsSubmit(payload);
      dispatch({ type: 'SET_EVENT_ID', payload: saved.id });
      dispatch({ type: 'SET_STATUS', payload: saved.status });
      showNotification('Event submitted for approval.', 'success');
      setSummaryOpen(true);
      setTimeout(() => navigate('/organizer/dashboard'), 2000);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Gửi sự kiện thất bại');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const summaryItems = useMemo(
    () => [
      { label: 'Event Name', value: state.basicInfo.name },
      { label: 'Event Code', value: state.basicInfo.eventCode },
      { label: 'Category', value: state.basicInfo.category },
      { label: 'Organizer', value: state.organizerInfo.organizerName },
      { label: 'Showtimes', value: `${state.showtimes.length} entries` },
      { label: 'Ticket Types', value: `${state.ticketTypes.length} entries` },
      { label: 'Ticket Zones', value: `${state.ticketDetails.length} entries` },
      { label: 'Custom URL', value: state.settings.customUrl },
      { label: 'Privacy', value: state.settings.privacy },
    ],
    [state]
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Create Event Wizard</Typography>
        <Button variant="outlined" onClick={saveDraft} disabled={loading}>
          Save Draft
        </Button>
      </Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Event Details</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Event Code" value={state.basicInfo.eventCode} InputProps={{ readOnly: true }} />
                <TextField
                  label="Event Name"
                  required
                  value={state.basicInfo.name}
                  onChange={e => dispatch({ type: 'UPDATE_BASIC_INFO', payload: { name: e.target.value } })}
                />
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    label="Category"
                    value={state.basicInfo.category && categories.includes(state.basicInfo.category) ? state.basicInfo.category : categories[0]}
                    onChange={e => {
                      const value = e.target.value;
                      if (categories.includes(value)) {
                        dispatch({ type: 'UPDATE_BASIC_INFO', payload: { category: value } });
                      }
                    }}
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  value={state.basicInfo.description}
                  onChange={e => dispatch({ type: 'UPDATE_BASIC_INFO', payload: { description: e.target.value } })}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Images</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label">
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'logoUrl')}
                    />
                  </Button>
                  {state.basicInfo.logoUrl && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span role="img" aria-label="success">✅</span> Logo uploaded
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label">
                    Upload Banner/Background
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'bannerUrl')}
                    />
                  </Button>
                  {state.basicInfo.bannerUrl && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span role="img" aria-label="success">✅</span> Banner uploaded
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {!isOnline && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Location</Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Venue Name"
                    value={state.basicInfo.venue.name}
                    onChange={e => dispatch({ type: 'UPDATE_VENUE', payload: { name: e.target.value } })}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Province/City</InputLabel>
                    <Select
                      label="Province/City"
                      value={state.basicInfo.venue.province}
                      onChange={e => dispatch({ type: 'UPDATE_VENUE', payload: { province: e.target.value } })}
                    >
                      {vietnamProvinces.map(province => (
                        <MenuItem key={province} value={province}>{province}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="District"
                    value={state.basicInfo.venue.district}
                    onChange={e => dispatch({ type: 'UPDATE_VENUE', payload: { district: e.target.value } })}
                  />
                  <TextField
                    label="Ward"
                    value={state.basicInfo.venue.ward}
                    onChange={e => dispatch({ type: 'UPDATE_VENUE', payload: { ward: e.target.value } })}
                  />
                  <TextField
                    label="Street Address"
                    value={state.basicInfo.venue.streetAddress}
                    onChange={e => dispatch({ type: 'UPDATE_VENUE', payload: { streetAddress: e.target.value } })}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Organizer Info</Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField label="Organizer Code" value={state.organizerInfo.organizerCode} InputProps={{ readOnly: true }} />
                <TextField
                  label="Organizer Name"
                  value={state.organizerInfo.organizerName}
                  onChange={e => dispatch({ type: 'UPDATE_ORGANIZER_INFO', payload: { organizerName: e.target.value } })}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button variant="outlined" component="label">
                    Upload Logo
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={e => e.target.files && handleFileUpload(e.target.files[0], 'organizerLogo')}
                    />
                  </Button>
                  {state.organizerInfo.logoUrl && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span role="img" aria-label="success">✅</span> Organizer logo uploaded
                    </Typography>
                  )}
                </Box>
                <TextField
                  label="Description"
                  multiline
                  minRows={3}
                  value={state.organizerInfo.description}
                  onChange={e => dispatch({ type: 'UPDATE_ORGANIZER_INFO', payload: { description: e.target.value } })}
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Permissions</Typography>
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', border: '1px solid #ddd', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>Terms and Conditions</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {termsAndConditions}
                </Typography>
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={state.organizerInfo.termsAgreed}
                    onChange={e => dispatch({ type: 'UPDATE_ORGANIZER_INFO', payload: { termsAgreed: e.target.checked } })}
                  />
                }
                label="I agree to the terms and conditions"
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {activeStep === 2 && (
        <Box sx={{ display: 'grid', gap: 3, overflowX: 'auto' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Showtimes</Typography>
              <Button onClick={() => dispatch({ type: 'SET_SHOWTIMES', payload: [...state.showtimes, createShowtime()] })}>
                Add Showtime
              </Button>
              <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 120 }}>Showtime Code</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>Start Time</TableCell>
                    <TableCell sx={{ minWidth: 200 }}>End Time</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.showtimes.map((showtime, index) => (
                    <TableRow key={showtime.code}>
                      <TableCell>{showtime.code}</TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={showtime.startTime}
                          onChange={e => {
                            const next = [...state.showtimes];
                            next[index] = { ...showtime, startTime: e.target.value };
                            dispatch({ type: 'SET_SHOWTIMES', payload: next });
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={showtime.endTime}
                          onChange={e => {
                            const next = [...state.showtimes];
                            next[index] = { ...showtime, endTime: e.target.value };
                            dispatch({ type: 'SET_SHOWTIMES', payload: next });
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="error"
                          onClick={() => {
                            const next = state.showtimes.filter((_, idx) => idx !== index);
                            dispatch({ type: 'SET_SHOWTIMES', payload: next });
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ticket Types</Typography>
              <Button onClick={() => dispatch({ type: 'SET_TICKET_TYPES', payload: [...state.ticketTypes, createTicketType()] })}>
                Add Ticket Type
              </Button>
              <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 100 }}>Type Code</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Name</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>Price</TableCell>
                    <TableCell sx={{ minWidth: 120 }}>Max Qty</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Sale Start</TableCell>
                    <TableCell sx={{ minWidth: 160 }}>Sale End</TableCell>
                    <TableCell sx={{ minWidth: 130 }}>Description</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.ticketTypes.map((ticketType, index) => (
                    <TableRow key={ticketType.code}>
                      <TableCell>{ticketType.code}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={ticketType.name}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, name: e.target.value };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={ticketType.price}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, price: Number(e.target.value) };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={ticketType.maxQuantity}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, maxQuantity: Number(e.target.value) };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={ticketType.saleStart}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, saleStart: e.target.value };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={ticketType.saleEnd}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, saleEnd: e.target.value };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={ticketType.description}
                          onChange={e => {
                            const next = [...state.ticketTypes];
                            next[index] = { ...ticketType, description: e.target.value };
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="error"
                          onClick={() => {
                            const next = state.ticketTypes.filter((_, idx) => idx !== index);
                            dispatch({ type: 'SET_TICKET_TYPES', payload: next });
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeStep === 3 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Ticket Details</Typography>
              <Button onClick={() => dispatch({ type: 'SET_TICKET_DETAILS', payload: [...state.ticketDetails, createTicketDetail()] })}>
                Add Ticket Detail
              </Button>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ticket Code</TableCell>
                    <TableCell>Zone/Seat Name</TableCell>
                    <TableCell>Ticket Type</TableCell>
                    <TableCell>Check-in Time</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.ticketDetails.map((detail, index) => (
                    <TableRow key={detail.code}>
                      <TableCell>{detail.code}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={detail.zoneName}
                          onChange={e => {
                            const next = [...state.ticketDetails];
                            next[index] = { ...detail, zoneName: e.target.value };
                            dispatch({ type: 'SET_TICKET_DETAILS', payload: next });
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={detail.ticketTypeCode}
                            onChange={e => {
                              const next = [...state.ticketDetails];
                              next[index] = { ...detail, ticketTypeCode: e.target.value };
                              dispatch({ type: 'SET_TICKET_DETAILS', payload: next });
                            }}
                          >
                            {state.ticketTypes.map(type => (
                              <MenuItem key={type.code} value={type.code}>{type.name || type.code}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          value={detail.checkInTime}
                          onChange={e => {
                            const next = [...state.ticketDetails];
                            next[index] = { ...detail, checkInTime: e.target.value };
                            dispatch({ type: 'SET_TICKET_DETAILS', payload: next });
                          }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          color="error"
                          onClick={() => {
                            const next = state.ticketDetails.filter((_, idx) => idx !== index);
                            dispatch({ type: 'SET_TICKET_DETAILS', payload: next });
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Mapping (Allocation)</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Showtime</TableCell>
                    {state.ticketTypes.map(type => (
                      <TableCell key={type.code}>{type.name || type.code}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {state.showtimes.map(showtime => (
                    <TableRow key={showtime.code}>
                      <TableCell>{showtime.code}</TableCell>
                      {state.ticketTypes.map(type => (
                        <TableCell key={`${showtime.code}-${type.code}`}>
                          <TextField
                            type="number"
                            size="small"
                            value={getAllocationValue(showtime.code, type.code)}
                            onChange={e => updateAllocation(showtime.code, type.code, Number(e.target.value))}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeStep === 4 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>💳 Payout Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Provide your bank account details where payments will be transferred.
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <TextField
                  label="Account Holder Name"
                  placeholder="Full name of the account holder"
                  value={state.payoutInfo.accountHolderName}
                  onChange={e => dispatch({ type: 'UPDATE_PAYOUT', payload: { accountHolderName: e.target.value } })}
                  fullWidth
                />
                <TextField
                  label="Bank Account Number"
                  placeholder="Your bank account number"
                  value={state.payoutInfo.bankNumber}
                  onChange={e => dispatch({ type: 'UPDATE_PAYOUT', payload: { bankNumber: e.target.value } })}
                  fullWidth
                />
                <TextField
                  label="Bank Name"
                  placeholder="Name of your bank"
                  value={state.payoutInfo.bankName}
                  onChange={e => dispatch({ type: 'UPDATE_PAYOUT', payload: { bankName: e.target.value } })}
                  fullWidth
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>📄 Invoice Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Optionally enable electronic invoicing for your customers.
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={state.invoiceInfo.enabled}
                      onChange={e => dispatch({ type: 'UPDATE_INVOICE', payload: { enabled: e.target.checked } })}
                    />
                  }
                  label="Enable electronic invoicing"
                />
                {state.invoiceInfo.enabled && (
                  <>
                    <TextField
                      label="Company Name"
                      placeholder="Your company name for invoices"
                      value={state.invoiceInfo.companyName}
                      onChange={e => dispatch({ type: 'UPDATE_INVOICE', payload: { companyName: e.target.value } })}
                      fullWidth
                    />
                    <TextField
                      label="Tax Code / VAT Number"
                      placeholder="e.g., 0123456789-001"
                      value={state.invoiceInfo.taxCode}
                      onChange={e => dispatch({ type: 'UPDATE_INVOICE', payload: { taxCode: e.target.value } })}
                      fullWidth
                    />
                    <TextField
                      label="Company Address"
                      placeholder="Your company address for invoices"
                      multiline
                      minRows={2}
                      value={state.invoiceInfo.address}
                      onChange={e => dispatch({ type: 'UPDATE_INVOICE', payload: { address: e.target.value } })}
                      fullWidth
                    />
                  </>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Payout Details:</Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Account:</strong> {state.payoutInfo.accountHolderName || '(Not provided)'}<br />
                  <strong>Bank:</strong> {state.payoutInfo.bankName || '(Not provided)'}<br />
                  <strong>Number:</strong> {state.payoutInfo.bankNumber ? `***${state.payoutInfo.bankNumber.slice(-4)}` : '(Not provided)'}
                </Typography>
                {state.invoiceInfo.enabled && (
                  <>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Invoice Details:</Typography>
                    <Typography variant="body2">
                      <strong>Company:</strong> {state.invoiceInfo.companyName || '(Not provided)'}<br />
                      <strong>Tax Code:</strong> {state.invoiceInfo.taxCode || '(Not provided)'}<br />
                      <strong>Address:</strong> {state.invoiceInfo.address || '(Not provided)'}
                    </Typography>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {activeStep === 5 && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Summary</Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {summaryItems.map(item => (
                  <Typography key={item.label} variant="body2">
                    <strong>{item.label}:</strong> {item.value || '--'}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Action</Typography>
              <Button variant="contained" onClick={submitEvent} disabled={loading}>
                Submit for Approval
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Status</Typography>
              <Typography variant="body2">{state.status || 'Pending Approval'}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep < steps.length - 1 && (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      <Dialog open={summaryOpen} onClose={() => setSummaryOpen(false)}>
        <DialogTitle>Submission Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Pending Approval</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSummaryOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const EventWizardPage: React.FC = () => (
  <EventWizardProvider>
    <EventWizardInner />
  </EventWizardProvider>
);

export default EventWizardPage;
