import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, CircularProgress, Box, Alert } from '@mui/material';
import { PaymentsService } from '../api/services/PaymentsService';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const PaymentReturnPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      const params = new URLSearchParams(location.search);
      const paramsMap = Object.fromEntries(params.entries());

      try {
        await PaymentsService.getApiPaymentsVnpayReturn(paramsMap);
        showNotification('Payment completed successfully!', 'success');
        // Redirect to a confirmation page or user's ticket page
        navigate('/my-tickets'); 
      } catch (err: any) {
        const errorData = getErrorMessage(err, 'Thanh toán thất bại');
        setError(errorData.message);
        showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
      } finally {
        setLoading(false);
      }
    };

    processPaymentReturn();
  }, [location, navigate, showNotification]);

  return (
    <Container sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {loading ? (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Processing your payment, please wait...
          </Typography>
        </>
      ) : error ? (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 'sm' }}>
          <Typography variant="h6">Payment Failed</Typography>
          <Typography>{error}</Typography>
        </Alert>
      ) : (
        <Alert severity="success" sx={{ width: '100%', maxWidth: 'sm' }}>
          <Typography variant="h6">Payment Successful!</Typography>
          <Typography>You are being redirected...</Typography>
        </Alert>
      )}
    </Container>
  );
};

export default PaymentReturnPage;
