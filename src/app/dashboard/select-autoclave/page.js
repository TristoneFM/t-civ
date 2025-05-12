'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  useTheme,
  CircularProgress,
  Container
} from '@mui/material';

export default function SelectAutoclave() {
  const [selectedStation, setSelectedStation] = useState('');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/api/autoclaves');
        if (!response.ok) {
          throw new Error('Failed to fetch stations');
        }
        const data = await response.json();
        setStations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStation) {
      router.push(`/dashboard/autoclave/${selectedStation}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      mt: -25
    }}>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 4, sm: 6 },
            width: '100%',
            maxWidth: 600,
            borderRadius: 3,
            mx: 'auto',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, #FFD700)`,
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                position: 'relative',
                mb: 3
              }}
            >
              <img
                src="/tristone.png"
                alt="Tristone Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="600">
              Seleccionar Autoclave
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Seleccionar Autoclave"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              sx={{ 
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  fontSize: '1.1rem',
                  py: 1
                }
              }}
            >
              {stations.map((station) => (
                <MenuItem key={station._id} value={station._id} sx={{ fontSize: '1.3rem' }}>
                  {station.stationName}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!selectedStation}
              size="large"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '1.1rem',
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                }
              }}
            >
              Continuar
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
