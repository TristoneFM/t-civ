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
  CircularProgress
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
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={2}
        sx={{
          p: 3,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
          mx: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box 
            sx={{ 
              width: 150, 
              height: 150, 
              position: 'relative',
              mb: 2
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
          <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="600">
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
            sx={{ mb: 3 }}
          >
            {stations.map((station) => (
              <MenuItem key={station._id} value={station._id}>
                {station.stationName}
              </MenuItem>
            ))}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!selectedStation}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Continuar
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
