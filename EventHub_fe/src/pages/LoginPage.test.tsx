import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider, useNotification } from '../context/NotificationContext';
import { vi } from 'vitest';

// Mock the react-router-dom's useNavigate hook
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock the AuthContext
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();
const mockAuthContextValue = {
  isAuthenticated: false,
  user: null,
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  loading: false,
  error: null,
};
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuthContextValue,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the NotificationContext
const mockShowNotification = vi.fn();
vi.mock('../context/NotificationContext', () => ({
  useNotification: () => ({ showNotification: mockShowNotification }),
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));


describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContextValue.isAuthenticated = false; // Reset auth state for each test
    mockAuthContextValue.loading = false;
    mockAuthContextValue.error = null;
  });

  it('renders login form elements', () => {
    render(
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    );

    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined); // Simulate successful login

    render(
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    // Expect navigation to home page on successful login
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('handles failed login', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage)); // Simulate failed login
    mockAuthContextValue.error = errorMessage; // Simulate error being set by AuthContext

    render(
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'wrong@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpass',
      });
    });

    // Expect error notification to be shown
    expect(mockShowNotification).toHaveBeenCalledWith(errorMessage, 'danger');
    // Should not navigate on failed login
    expect(mockedNavigate).not.toHaveBeenCalledWith('/');
  });

  it('redirects to home if already authenticated', () => {
    mockAuthContextValue.isAuthenticated = true; // Simulate already authenticated

    render(
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    );

    // Expect immediate redirection to home
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  it('shows loading state during login', () => {
    mockAuthContextValue.loading = true; // Simulate loading state

    render(
      <Router>
        <NotificationProvider>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </NotificationProvider>
      </Router>
    );

    expect(screen.getByRole('button', { name: /logging in.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in.../i })).toBeDisabled();
  });
});
