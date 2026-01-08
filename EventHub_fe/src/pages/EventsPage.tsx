import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button, Box, TextField, CircularProgress, Paper, InputAdornment, Pagination, Stack, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import { EventStatus } from '../api/models/EventStatus';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { getErrorMessage, getNotificationSeverity } from '../utils/errorHandler';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

const EVENTS_PER_PAGE = 9;
const categories = ['Music', 'Sports', 'Arts & Theater', 'Conferences', 'Festivals', 'Other'];
const locations = ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hoi An', 'Nha Trang'];

const EventsPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // UI State (controlled inputs)
  const [keyword, setKeyword] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Search/Filter State (triggers API call)
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: ''
  });

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await EventsService.getApiEventsSearch(
        searchParams.keyword || undefined,
        searchParams.category || undefined,
        undefined, // startTime
        undefined, // endTime
        searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
        searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
        EventStatus.PUBLISHED,
        searchParams.location || undefined,
        currentPage,
        EVENTS_PER_PAGE
      );
      setEvents(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);

      // If current page is empty but we have total elements and are not on page 0, go back
      if ((response.content || []).length === 0 && (response.totalElements || 0) > 0 && currentPage > 0) {
        setCurrentPage(prev => Math.max(0, prev - 1));
      } 
    } catch (err: any) {
      const errorData = getErrorMessage(err, 'Không thể tải danh sách sự kiện. Vui lòng thử lại sau.');
      showNotification(errorData.message, getNotificationSeverity(errorData.type) as any);
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage, showNotification]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(0); // Reset to first page on new search
    setSearchParams({
      keyword,
      category,
      location,
      minPrice,
      maxPrice
    });
  };

  const handleClearFilters = () => {
    setKeyword('');
    setCategory('');
    setLocation('');
    setMinPrice('');
    setMaxPrice('');
    
    setCurrentPage(0);
    setSearchParams({
      keyword: '',
      category: '',
      location: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value - 1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          Explore Events
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find the best concerts, workshops, and conferences near you.
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 6, 
          bgcolor: 'background.paper', 
          borderRadius: 3, 
          border: '1px solid', 
          borderColor: 'divider',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item component="div" xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search events, artists..."
                variant="outlined"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item component="div" xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as string)}
                  label="Category"
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item component="div" xs={12} sm={6} md={2}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Location</InputLabel>
                <Select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as string)}
                  label="Location"
                >
                  <MenuItem value=""><em>All</em></MenuItem>
                  {locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item component="div" xs={6} md={1.5}>
              <TextField
                fullWidth
                label="Min $"
                type="number"
                variant="outlined"
                size="medium"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </Grid>
            <Grid item component="div" xs={6} md={1.5}>
              <TextField
                fullWidth
                label="Max $"
                type="number"
                variant="outlined"
                size="medium"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </Grid>
            <Grid item component="div" xs={12} md={1} sx={{ display: 'flex', gap: 1 }}>
              <Button type="submit" variant="contained" color="primary" fullWidth sx={{ height: '56px' }}>
                Go
              </Button>
            </Grid>
          </Grid>
          {/* Show Clear button if local state has content OR active search has content */}
          {(keyword || category || location || minPrice || maxPrice || searchParams.keyword) && (
             <Box sx={{ mt: 2, textAlign: 'right' }}>
               <Button size="small" onClick={handleClearFilters} color="inherit">Clear Filters</Button>
             </Box>
          )}
        </form>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {events.length === 0 ? (
              <Grid item component="div" xs={12}>
                <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary">No events found matching your criteria.</Typography>
                  <Button onClick={handleClearFilters} sx={{ mt: 2 }}>Clear All Filters</Button>
                </Box>
              </Grid>
            ) : (
              events.map((event, index) => (
                <Grid item component="div" xs={12} sm={6} md={4} key={event.id}>
                  <Card
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 'none',
                      '&:hover': {
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-4px)',
                        borderColor: 'transparent'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="220"
                        image={event.bannerUrl || event.coverImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="220"%3E%3Crect width="400" height="220" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" font-size="20" text-anchor="middle" dy=".3em" fill="%23999"%3EEvent%3C/text%3E%3C/svg%3E'}
                        alt={event.name}
                        sx={{ filter: 'brightness(0.95)' }}
                      />
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 12, 
                          left: 12, 
                          bgcolor: 'white', 
                          borderRadius: 1, 
                          p: 0.5, 
                          px: 1.5, 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          boxShadow: 1
                        }}
                      >
                        {event.category}
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                      <Typography gutterBottom variant="h6" component="h2" fontWeight={700} sx={{ lineHeight: 1.3, mb: 1 }}>
                        {event.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
                        <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2">
                          {event.startTime ? new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBA'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 18, mr: 0.8 }} />
                        <Typography variant="body2">
                          {event.venue?.city || 'TBA'}
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        mb: 2
                      }}>
                        {event.description}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button 
                        component={RouterLink} 
                        to={`/events/${event.id}`} 
                        variant="outlined" 
                        fullWidth
                        sx={{ 
                          borderWidth: 1.5, 
                          fontWeight: 600,
                          '&:hover': { borderWidth: 1.5 }
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
          
          {totalPages > 1 && (
            <Stack spacing={2} sx={{ mt: 5, alignItems: 'center' }}>
              <Pagination 
                count={totalPages} 
                page={currentPage + 1} 
                onChange={handlePageChange} 
                color="primary" 
                showFirstButton 
                showLastButton 
                size="large"
              />
              <Typography variant="body2" color="text.secondary">
                Showing {events.length} of {totalElements} events
              </Typography>
            </Stack>
          )}
        </>
      )}
    </Container>
  );
};

export default EventsPage;
