import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Placeholder Components
const NotFoundPage: React.FC = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h1>404</h1>
    <p>Page not found</p>
  </div>
);

// Actual Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ProfilePage from './pages/ProfilePage';
import EventWizardPage from './pages/EventWizardPage';
import OrganizerOrdersPage from './pages/OrganizerOrdersPage';
import OrganizerReportsPage from './pages/OrganizerReportsPage';
import CheckInPage from './pages/CheckInPage';
import StaffManagementPage from './pages/StaffManagementPage';
import AdminContentManagementPage from './pages/AdminContentManagementPage';
import OrganizerDashboardPage from './pages/OrganizerDashboardPage';
import OrganizerEventDetailPage from './pages/OrganizerEventDetailPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminEventApprovalPage from './pages/AdminEventApprovalPage';
import PaymentReturnPage from './pages/PaymentReturnPage';
import PassTicketsPage from './pages/PassTicketsPage';
import { CircularProgress, Box } from '@mui/material';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/payment-return" element={<PaymentReturnPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/pass-tickets" element={<PassTicketsPage />} />
          <Route path="/my-orders" element={<OrderHistoryPage />} />
          <Route path="/my-orders/:id" element={<OrderDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ORGANIZER']} />}>
          <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
          <Route path="/organizer/events/new" element={<EventWizardPage />} />
          <Route path="/organizer/events/edit/:id" element={<EventWizardPage />} />
          <Route path="/organizer/events/:id" element={<OrganizerEventDetailPage />} />
          <Route path="/organizer/orders" element={<OrganizerOrdersPage />} />
          <Route path="/organizer/reports" element={<OrganizerReportsPage />} />
          <Route path="/organizer/staff" element={<StaffManagementPage />} />
          <Route path="/organizer/staff" element={<StaffManagementPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ORGANIZER', 'ROLE_ADMIN']} />}>
          <Route path="/staff/checkin" element={<CheckInPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/events" element={<AdminEventApprovalPage />} />
          <Route path="/admin/content" element={<AdminContentManagementPage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
