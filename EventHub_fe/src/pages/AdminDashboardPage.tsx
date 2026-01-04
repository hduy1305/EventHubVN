import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Typography, Box, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert, List, ListItem, ListItemText, IconButton, Autocomplete } from '@mui/material';
import { OrganizationService } from '../api/services/OrganizationService';
import type { Organization } from '../api/models/Organization';
import type { UserOrganizationRole } from '../api/models/UserOrganizationRole';
import type { Role } from '../api/models/Role';
import { RolesService } from '../api/services/RolesService';
import { UsersService } from '../api/services/UsersService';
import type { User } from '../api/models/User';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(true);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [organizationUsersRoles, setOrganizationUsersRoles] = useState<UserOrganizationRole[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [showAddUserRoleModal, setShowAddUserRoleModal] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newRoleId, setNewRoleId] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for Create New Organization form
  const [newOrgName, setNewOrgName] = useState('');
  const [owner, setOwner] = useState<User | null>(null);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const [globalPaymentMethods, setGlobalPaymentMethods] = useState<string[]>(['Credit Card', 'PayPal']);
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>('');
  const [globalServiceFee, setGlobalServiceFee] = useState<number>(0.05);
  const [globalTaxRate, setGlobalTaxRate] = useState<number>(0.07);
  const [globalRefundPolicyText, setGlobalRefundPolicyText] = useState<string>('Standard refund policy: 14 days full refund.');

  useEffect(() => {
    const roles = user?.roles || [];
    const isAdmin = roles.some((role: any) => role.authority === 'ADMIN' || role.authority === 'ROLE_ADMIN');
    if (!isAdmin) {
      showNotification('You are not authorized to access this page.', 'error');
      setLoading(false);
      return;
    }
    fetchOrganizations();
    fetchRoles();
  }, [user, showNotification]);

  const fetchUsers = async (term: string) => {
    if (!term || term.trim().length < 1) {
      setUserOptions([]);
      return;
    }
    try {
      const users = await UsersService.searchUsers(term.trim());
      setUserOptions(users);
    } catch (err) {
      console.error('User search failed', err);
      setUserOptions([]);
    }
  };

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const fetchedOrganizations = await OrganizationService.getApiOrganizations();
      setOrganizations(fetchedOrganizations);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to fetch organizations.';
      showNotification(errorMessage, 'error');
      console.error("Failed to fetch organizations:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizationUsersAndRoles = async (orgId: string) => {
    setLoading(true);
    try {
      const fetchedUsersRoles = await OrganizationService.getApiOrganizationsUsersRoles(orgId);
      setOrganizationUsersRoles(fetchedUsersRoles);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || `Failed to fetch users for organization ${orgId}.`;
      showNotification(errorMessage, 'error');
      console.error("Failed to fetch org users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const fetchedRoles = await RolesService.getApiAdminRoles();
      setRoles(fetchedRoles);
    } catch (err: any) {
      console.error('Failed to fetch roles', err);
    }
  };

  const handleSelectOrganization = (event: React.ChangeEvent<HTMLInputElement>) => {
    const orgId = event.target.value;
    const org = organizations.find(o => o.id === orgId);
    setSelectedOrganization(org || null);
    if (org) {
      fetchOrganizationUsersAndRoles(org.id!);
    } else {
      setOrganizationUsersRoles([]);
    }
  };

  const handleAddUserRole = async () => {
    const targetUserId = selectedUser?.id || newUserId;
    if (!selectedOrganization?.id || !targetUserId || !newRoleId) {
      showNotification('Please select an organization, user, and role.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await OrganizationService.postApiOrganizationsUsersRoles(
        selectedOrganization.id,
        targetUserId,
        parseInt(newRoleId)
      );
      showNotification('User role added successfully!', 'success');
      fetchOrganizationUsersAndRoles(selectedOrganization.id);
      setShowAddUserRoleModal(false);
      setNewUserId('');
      setNewRoleId('');
      setSelectedUser(null);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to add user role.';
      showNotification(errorMessage, 'error');
      console.error("Failed to add user role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userOrgRoleId: number, newRole: number) => {
    if (!window.confirm(`Are you sure you want to update role for ID ${userOrgRoleId} to Role ID ${newRole}?`)) {
      return;
    }
    setLoading(true);
    try {
      await OrganizationService.putApiOrganizationsUserOrganizationRolesRoles(userOrgRoleId, newRole);
      showNotification('User role updated successfully!', 'success');
      fetchOrganizationUsersAndRoles(selectedOrganization!.id!);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to update user role.';
      showNotification(errorMessage, 'error');
      console.error("Failed to update user role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserRole = async (userOrgRoleId: number) => {
    if (!window.confirm(`Are you sure you want to remove user role ID ${userOrgRoleId}?`)) {
      return;
    }
    setLoading(true);
    try {
      await OrganizationService.deleteApiOrganizationsUserOrganizationRoles(userOrgRoleId);
      showNotification('User role removed successfully!', 'success');
      fetchOrganizationUsersAndRoles(selectedOrganization!.id!);
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to remove user role.';
      showNotification(errorMessage, 'error');
      console.error("Failed to remove user role:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !owner) {
      showNotification('Please provide a name and select an owner for the new organization.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await OrganizationService.postApiOrganizations(
        owner.id!,
        {
          name: newOrgName,
          contactEmail: owner.email,
        }
      );
      showNotification('Organization created successfully!', 'success');
      setNewOrgName('');
      setOwner(null);
      fetchOrganizations(); // Refresh the list
    } catch (err: any) {
      const errorMessage = err.body?.message || err.response?.data?.message || err.message || 'Failed to create organization.';
      showNotification(errorMessage, 'error');
      console.error("Failed to create organization:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    if (newPaymentMethod && !globalPaymentMethods.includes(newPaymentMethod)) {
      setGlobalPaymentMethods([...globalPaymentMethods, newPaymentMethod]);
      setNewPaymentMethod('');
      showNotification('Payment method added (frontend only)!', 'success');
    } else if (newPaymentMethod) {
      showNotification('Payment method already exists!', 'warning');
    }
  };

  const handleRemovePaymentMethod = (methodToRemove: string) => {
    setGlobalPaymentMethods(globalPaymentMethods.filter(method => method !== methodToRemove));
    showNotification('Payment method removed (frontend only)!', 'info');
  };

  const handleSaveGlobalPolicies = () => {
    showNotification('Global policies saved (frontend only)!', 'success');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Admin Dashboard</Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button component={RouterLink} to="/admin/events" variant="contained">
              Manage Event Approvals
            </Button>
            <Button component={RouterLink} to="/admin/support" variant="contained" color="info">
              Support Center
            </Button>
            <Button component={RouterLink} to="/admin/content" variant="contained" color="secondary">
              Content Management
            </Button>
          </Box>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Create New Organization</Typography>
          <TextField
            label="Organization Name"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={userOptions}
            getOptionLabel={(option) => option.fullName || option.email || option.id || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(e, newValue) => {
              setOwnerSearch(newValue);
              fetchUsers(newValue);
            }}
            onChange={(e, newValue) => setOwner(newValue)}
            value={owner}
            filterOptions={(opts) => opts}
            loading={ownerSearch.length > 0 && userOptions.length === 0}
            noOptionsText={ownerSearch ? 'No users found' : 'Type to search users'}
            renderInput={(params) => <TextField {...params} label="Owner" fullWidth />}
          />
          <Button variant="contained" onClick={handleCreateOrganization} disabled={loading} sx={{mt: 2}}>
            Create Organization
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Organization Management</Typography>
          <TextField
            select
            label="Select Organization"
            fullWidth
            value={selectedOrganization?.id || ''}
            onChange={handleSelectOrganization}
            sx={{ mb: 3 }}
          >
            <MenuItem value="">-- Select an Organization --</MenuItem>
            {organizations.map(org => (
              <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
            ))}
          </TextField>

          {selectedOrganization && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1">Details</Typography>
                <Typography variant="body2"><strong>ID:</strong> {selectedOrganization.id}</Typography>
                <Typography variant="body2"><strong>Description:</strong> {selectedOrganization.description}</Typography>
                <Typography variant="body2"><strong>Contact:</strong> {selectedOrganization.contactEmail}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Users & Roles</Typography>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowAddUserRoleModal(true)}>
                  Add User Role
                </Button>
              </Box>

              {organizationUsersRoles.length === 0 ? (
                <Alert severity="info">No users assigned roles in this organization.</Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {organizationUsersRoles.map(uor => (
                        <TableRow key={uor.id}>
                          <TableCell>{uor.userId}</TableCell>
                          <TableCell>{uor.userName}</TableCell>
                          <TableCell>{uor.userEmail}</TableCell>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={uor.roleId ? uor.roleId.toString() : ''}
                              onChange={(e) => handleUpdateUserRole(uor.id!, parseInt(e.target.value))}
                            >
                              {roles.map(r => (
                                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleRemoveUserRole(uor.id!)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        <Grid component="div" xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Global Payment Methods</Typography>
              <List>
                {globalPaymentMethods.map((method, index) => (
                  <ListItem key={index} secondaryAction={
                    <IconButton edge="end" aria-label="delete" onClick={() => handleRemovePaymentMethod(method)}>
                      <DeleteIcon />
                    </IconButton>
                  }>
                    <ListItemText primary={method} />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  label="New Method"
                  size="small"
                  fullWidth
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                />
                <Button variant="contained" onClick={handleAddPaymentMethod}>Add</Button>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>Frontend only demo.</Alert>
            </CardContent>
          </Card>
        </Grid>

        <Grid component="div" xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Global Fees & Policies</Typography>
              <Grid container spacing={2}>
                <Grid component="div" xs={6}>
                  <TextField
                    label="Service Fee (%)"
                    type="number"
                    fullWidth
                    value={globalServiceFee * 100}
                    onChange={(e) => setGlobalServiceFee(parseFloat(e.target.value) / 100)}
                  />
                </Grid>
                <Grid component="div" xs={6}>
                  <TextField
                    label="Tax Rate (%)"
                    type="number"
                    fullWidth
                    value={globalTaxRate * 100}
                    onChange={(e) => setGlobalTaxRate(parseFloat(e.target.value) / 100)}
                  />
                </Grid>
                <Grid component="div" xs={12}>
                  <TextField
                    label="Refund Policy"
                    multiline
                    rows={3}
                    fullWidth
                    value={globalRefundPolicyText}
                    onChange={(e) => setGlobalRefundPolicyText(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSaveGlobalPolicies}>
                Save Settings
              </Button>
              <Alert severity="info" sx={{ mt: 2 }}>Frontend only demo.</Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={showAddUserRoleModal} onClose={() => setShowAddUserRoleModal(false)}>
      <DialogTitle>Add User Role</DialogTitle>
      <DialogContent>
          <Autocomplete
            options={userOptions}
            getOptionLabel={(option) => `${option.fullName || option.email} (${option.id})`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={selectedUser}
            onChange={(_, val) => {
              setSelectedUser(val);
              setNewUserId(val?.id || '');
            }}
            onInputChange={(_, value) => {
              setUserSearch(value);
              fetchUsers(value);
            }}
            filterOptions={(opts) => opts}
            loading={userSearch.length > 0 && userOptions.length === 0}
            noOptionsText={userSearch ? 'No users found' : 'Type to search users'}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Search user by name or email"
                fullWidth
              />
            )}
          />
          <TextField
            margin="dense"
            label="User ID (UUID)"
            fullWidth
            value={selectedUser?.id || newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            helperText="Auto-filled when selecting a user; you can also paste an ID."
          />
          <TextField
            select
            margin="dense"
            label="Role"
            fullWidth
            value={newRoleId}
            onChange={(e) => setNewRoleId(e.target.value)}
          >
            {roles.map(r => (
              <MenuItem key={r.id} value={r.id?.toString() || ''}>{r.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddUserRoleModal(false)}>Cancel</Button>
          <Button onClick={handleAddUserRole} disabled={loading} variant="contained">Add Role</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboardPage;
