import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Stack, TextField, Divider, Box } from '@mui/material';
import { MarketplaceService } from '../api/services/MarketplaceService';
import type { MarketplaceListing } from '../api/models/MarketplaceListing';
import type { PostTicketRequest } from '../api/models/PostTicketRequest';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';

const PassTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeListings, setActiveListings] = useState<MarketplaceListing[]>([]);
  const [myListings, setMyListings] = useState<MarketplaceListing[]>([]);
  const [newListing, setNewListing] = useState<PostTicketRequest>({
    ticketCode: '',
    price: 0,
    sellerId: '',
  });

  const refreshListings = async () => {
    try {
      const [active, mine] = await Promise.all([
        MarketplaceService.getActiveListings(),
        user?.id ? MarketplaceService.getSellerListings(user.id) : Promise.resolve([] as MarketplaceListing[]),
      ]);
      setActiveListings(active);
      setMyListings(mine);
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách vé');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  useEffect(() => {
    refreshListings();
  }, [user]);

  const handleBuy = async (listingId?: string) => {
    if (!listingId || !user?.id) {
      showNotification('Missing listing or user.', 'warning');
      return;
    }
    try {
      const res = await MarketplaceService.buyListing(listingId, user.id);
      showNotification(res.paymentUrl ? 'Redirecting to payment...' : 'Purchase initiated.', 'success');
      refreshListings();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể mua vé');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  const handlePost = async () => {
    if (!user?.id) {
      showNotification('You must be logged in to post a ticket.', 'warning');
      return;
    }
    if (!newListing.ticketCode || !newListing.price || newListing.price <= 0) {
      showNotification('Provide ticket code and a price greater than 0.', 'warning');
      return;
    }
    try {
      await MarketplaceService.postListing({
        ...newListing,
        sellerId: user.id,
      });
      showNotification('Ticket posted to marketplace.', 'success');
      setNewListing({ ticketCode: '', price: 0, sellerId: user.id });
      refreshListings();
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể đăng vé');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    }
  };

  const ListingCard = ({ listing }: { listing: MarketplaceListing }) => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{listing.ticket?.ticketCode || 'Ticket'}</Typography>
          <Chip label={listing.status} color={listing.status === 'ACTIVE' ? 'primary' : 'default'} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Seller: {listing.sellerId || 'N/A'}
        </Typography>
        <Typography variant="h5" sx={{ mt: 1 }}>
          {listing.price ? `$${listing.price}` : 'N/A'}
        </Typography>
      </CardContent>
      <CardActions>
        {listing.status === 'ACTIVE' && (
          <Button variant="contained" size="small" onClick={() => handleBuy(listing.id)}>
            Buy
          </Button>
        )}
      </CardActions>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>Tickets Being Passed</Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Post a ticket to marketplace</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Ticket Code"
              value={newListing.ticketCode}
              onChange={(e) => setNewListing({ ...newListing, ticketCode: e.target.value })}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={newListing.price}
              onChange={(e) => setNewListing({ ...newListing, price: parseFloat(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            <Button variant="contained" onClick={handlePost} disabled={!user}>
              Post Ticket
            </Button>
          </Stack>
          {!user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Please log in to list your ticket.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>Marketplace</Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {activeListings.length === 0 ? (
          <Grid item component="div" xs={12}><Typography>No active listings.</Typography></Grid>
        ) : (
          activeListings.map(listing => (
            <Grid item component="div" xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} />
            </Grid>
          ))
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>My Listings</Typography>
      <Grid container spacing={3}>
        {myListings.length === 0 ? (
          <Grid item component="div" xs={12}><Typography>You have no tickets posted.</Typography></Grid>
        ) : (
          myListings.map(listing => (
            <Grid item component="div" xs={12} sm={6} md={4} key={listing.id}>
              <ListingCard listing={listing} />
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default PassTicketsPage;
