import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, Box, Stack, CircularProgress, CardMedia, Alert, Tabs, Tab } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import LocalActivityOutlinedIcon from '@mui/icons-material/LocalActivityOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { EventsService } from '../api/services/EventsService';
import type { Event } from '../api/models/Event';
import { EventStatus } from '../api/models/EventStatus';
import { useNotification } from '../context/NotificationContext';

const HomePage: React.FC = () => {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'popular'>('upcoming');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const response = await EventsService.getApiEventsSearch(
          undefined, // keyword
          undefined, // category
          undefined, // startTime
          undefined, // endTime
          undefined, // minPrice
          undefined, // maxPrice
          EventStatus.PUBLISHED,
          undefined, // location
          0,
          6
        );
        let fetchedEvents = response.content || [];
        if (activeTab === 'popular') {
          // Placeholder for popularity: shuffle the fetched events
          fetchedEvents = fetchedEvents.sort(() => Math.random() - 0.5);
        }
        setEvents(fetchedEvents);
      } catch (err: any) {
        showNotification(err.message || 'Failed to fetch events', 'error');
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [showNotification, activeTab]);

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          borderRadius: { xs: '0 0 2rem 2rem', md: '0 0 4rem 4rem' },
          mb: 8,
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative circle */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
          }}
        />
        
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography 
            component={motion.h1}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            variant="h1" 
            sx={{ mb: 2, fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
          >
            Experience the Extraordinary
          </Typography>
          <Typography 
            component={motion.p}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            variant="h5" 
            sx={{ mb: 5, opacity: 0.9, fontWeight: 400, maxWidth: '600px', mx: 'auto' }}
          >
            Secure tickets for the world's most anticipated events. 
            Music, sports, arts, and more—all in one place.
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            alignItems="center"
            component={motion.div}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              component={RouterLink}
              to="/events"
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: 'grey.100' } 
              }}
            >
              Explore Events
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
              sx={{ 
                color: 'white', 
                borderColor: 'white', 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
            >
              Join Now
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
            WHY CHOOSE US
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            Built for Fan Experience
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center">
          {[
            { 
              icon: <LocalActivityOutlinedIcon sx={{ fontSize: 40 }} />, 
              title: 'Instant Booking', 
              text: 'Skip the line. Our streamlined checkout process secures your spot in seconds.' 
            },
            { 
              icon: <SecurityOutlinedIcon sx={{ fontSize: 40 }} />, 
              title: 'Secure & Reliable', 
              text: 'Bank-grade encryption ensures your payment details and tickets are always safe.' 
            },
            { 
              icon: <PhoneIphoneOutlinedIcon sx={{ fontSize: 40 }} />, 
              title: 'Mobile First', 
              text: 'Access your digital tickets instantly. No printing required, just scan and go.' 
            },
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                component={motion.div}
                whileHover={{ y: -8 }}
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 2,
                  bgcolor: 'background.default',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    borderColor: 'transparent'
                  }
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: '16px', 
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      mb: 3,
                      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {feature.text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Events Section */}
      <Container sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
            EXPLORE
          </Typography>
          <Typography variant="h3" fontWeight={700}>
            {activeTab === 'upcoming' ? 'Upcoming Events' : 'Most Popular'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Upcoming" value="upcoming" />
            <Tab label="Most Popular" value="popular" />
          </Tabs>
        </Box>

        {loadingEvents ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Alert severity="info" sx={{ textAlign: 'center' }}>No events available for this category.</Alert>
        ) : (
          <Grid container spacing={4}>
            {events.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                      image={event.coverImage || 'https://via.placeholder.com/400x220?text=Event'}
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
                        {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
            ))}
          </Grid>
        )}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button component={RouterLink} to="/events" variant="contained" size="large">
            View All Events
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      <Container sx={{ mb: 8 }}>
        <Box
          sx={{
            p: { xs: 4, md: 8 },
            bgcolor: 'background.paper',
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Host Your Own Event
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph sx={{ maxWidth: '600px', mx: 'auto', mb: 4, fontWeight: 400 }}>
            Join thousands of organizers who trust EventHub to manage sales, check-ins, and analytics.
          </Typography>
          <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ px: 5 }}>
            Get Started
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
