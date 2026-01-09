import React, { useState, useEffect } from 'react';
import {
  Container, Card, CardContent, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, 
  FormControl, InputLabel, Select, MenuItem, Chip, Alert, CircularProgress,
  Stack, IconButton, Tooltip
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UsersService } from '../api/services/UsersService';
import { OrganizationService } from '../api/services/OrganizationService';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import type { UserOrganizationRole } from '../api/models/UserOrganizationRole';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const StaffManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [staffMembers, setStaffMembers] = useState<UserOrganizationRole[]>([]);
  const [assignedEvents, setAssignedEvents] = useState<number[]>([]);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  
  // Form states
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | ''>('');

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrganizerEvents(),
        fetchOrgStaffMembers()
      ]);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Failed to load data');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerEvents = async () => {
    if (!user?.id) return;
    
    const response = await EventsService.getApiEventsSearch(
      undefined, undefined, undefined, undefined, undefined, undefined, 
      undefined, undefined, 0, 100
    );
    const allEvents = response.content || [];
    const organizerEvents = allEvents.filter(event => event.organizerId === user.id);
    setEvents(organizerEvents);
  };

  const fetchOrgStaffMembers = async () => {
    const organizerOrgId = user?.organizationRoles?.find(role => role.roleName === 'ORGANIZER')?.organizationId;
    if (!organizerOrgId) {
      setStaffMembers([]);
      return;
    }

    try {
      // Fetch staff members from organization API
      const usersRoles = await OrganizationService.getApiOrganizationsUsersRoles(organizerOrgId);
      // Filter only STAFF role members
      const staffList = usersRoles.filter(ur => ur.roleName === 'STAFF');
      setStaffMembers(staffList);
    } catch (err) {
      setStaffMembers([]);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffEmail.trim()) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    // Check if user has any organization roles at all
    if (!user?.organizationRoles || user.organizationRoles.length === 0) {
      showNotification('No organization found. Please create an organization first as an admin.', 'error');
      return;
    }
    
    const organizerOrgId = user.organizationRoles.find(role => role.roleName === 'ORGANIZER')?.organizationId;
    
    if (!organizerOrgId) {
      showNotification('You need to be an organizer to add staff members. Please contact admin to assign you as organizer.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Get user ID by email
      const userId = await UsersService.getApiUsersIdByEmail(newStaffEmail.trim());
      
      // Assign STAFF role to user in organization
      await OrganizationService.postApiOrganizationsUsersRolesByName(
        organizerOrgId, 
        userId, 
        'STAFF'
      );
      
      showNotification(`Staff member ${newStaffEmail} added successfully!`, 'success');
      setNewStaffEmail('');
      setOpenAddDialog(false);
      
      // Refresh staff list
      await fetchOrgStaffMembers();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Failed to add staff member');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToEvent = async () => {
    if (!selectedStaffId || !selectedEventId) {
      showNotification('Please select both staff member and event.', 'error');
      return;
    }

    setLoading(true);
    try {
      const eventIdNum = Number(selectedEventId);
      
      await UsersService.postApiUsersAssignedEvents(selectedStaffId, eventIdNum);
      
      const selectedStaff = staffMembers.find(s => s.userId === selectedStaffId);
      const selectedEvent = events.find(e => e.id === selectedEventId);
      
      showNotification(
        `${selectedStaff?.userEmail} assigned to "${selectedEvent?.name}" successfully!`, 
        'success'
      );
      
      setSelectedStaffId('');
      setSelectedEventId('');
      setOpenAssignDialog(false);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Failed to assign staff to event');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStaff = async (staffRole: UserOrganizationRole) => {
    if (!window.confirm(`Remove ${staffRole.userEmail} from staff team? This will also remove all their event assignments.`)) {
      return;
    }

    if (!staffRole.id) {
      showNotification('Invalid staff member ID.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Delete all event assignments for this staff member
      if (staffRole.userId) {
        try {
          // Fetch assigned events for this user
          const assignedEventIds = await UsersService.getApiUsersAssignedEvents(staffRole.userId);
          
          // Delete each assignment
          for (const eventId of assignedEventIds) {
            try {
              await UsersService.deleteApiUsersAssignedEvents(staffRole.userId, eventId);
            } catch (err) {
              // Continue deleting other assignments even if one fails
            }
          }
        } catch (err) {
          // Continue with removing staff role even if assignment deletion fails
        }
      }

      // Remove staff role from organization
      await OrganizationService.deleteApiOrganizationsUserOrganizationRoles(staffRole.id);
      showNotification(`${staffRole.userEmail} removed from staff team and all event assignments deleted.`, 'success');
      
      // Refresh staff list
      await fetchOrgStaffMembers();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Failed to remove staff member');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Staff Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenAddDialog(true)}
          >
            Add Staff
          </Button>
        </Stack>
      </Box>

      {/* Staff Members Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Staff Team ({staffMembers.length})</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenAssignDialog(true)}
              disabled={staffMembers.length === 0 || events.length === 0}
            >
              Assign to Event
            </Button>
          </Box>
          
          {staffMembers.length === 0 ? (
            <Alert severity="info">No staff members found. Add your first staff member to get started.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {staffMembers.map((staff, index) => (
                    <TableRow key={staff.id || staff.userId || index}>
                      <TableCell>{staff.userEmail}</TableCell>
                      <TableCell>{staff.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label="STAFF" color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove from organization">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveStaff(staff)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Events ({events.length})
          </Typography>
          {events.length === 0 ? (
            <Alert severity="info">No events found. Create your first event to start managing staff assignments.</Alert>
          ) : (
            <Box sx={{ display: 'grid', gap: 2 }}>
              {events.map((event) => (
                <Paper key={event.id} variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {event.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.category} • {event.startTime ? new Date(event.startTime).toLocaleDateString() : 'TBD'}
                      </Typography>
                    </Box>
                    <Chip 
                      label={event.status} 
                      color={event.status === 'PUBLISHED' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Staff Member</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Staff Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newStaffEmail}
            onChange={(e) => setNewStaffEmail(e.target.value)}
            placeholder="Enter staff member's email"
            sx={{ mt: 1 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            The user will receive STAFF role in your organization and can be assigned to your events.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStaff} 
            variant="contained"
            disabled={!newStaffEmail.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Add Staff'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign to Event Dialog */}
      <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Staff to Event</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mt: 1 }}>
            <InputLabel>Select Staff Member</InputLabel>
            <Select
              value={selectedStaffId}
              onChange={async (e) => {
                const staffId = e.target.value;
                setSelectedStaffId(staffId);
                
                // Fetch assigned events for this staff
                if (staffId) {
                  try {
                    const assignedEventIds = await UsersService.getApiUsersAssignedEvents(staffId);
                    setAssignedEvents(assignedEventIds || []);
                  } catch (err) {
                    setAssignedEvents([]);
                  }
                } else {
                  setAssignedEvents([]);
                }
              }}
              label="Select Staff Member"
            >
              <MenuItem value="">
                <em>Choose a staff member...</em>
              </MenuItem>
              {staffMembers.map((staff) => (
                <MenuItem key={staff.userId} value={staff.userId}>
                  {staff.userEmail} ({staff.userName || 'No name'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
            <InputLabel>Select Event</InputLabel>
            <Select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value as number | '')}
              label="Select Event"
            >
              <MenuItem value="">
                <em>Choose an event...</em>
              </MenuItem>
              {events
                .filter(event => event.status === 'PUBLISHED' && assignedEvents.includes(event.id!))
                .map((event) => (
                  <MenuItem key={event.id} value={event.id}>
                    {event.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignToEvent} 
            variant="contained"
            disabled={!selectedStaffId || !selectedEventId || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StaffManagementPage;