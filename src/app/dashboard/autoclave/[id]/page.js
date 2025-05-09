'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  Button,
  Modal,
  Grid,
  IconButton,
  useTheme,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function CapturePage() {
  const params = useParams();
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [selectedMandrel, setSelectedMandrel] = useState(null);
  const [stationName, setStationName] = useState('');
  const [mandrels, setMandrels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goodPieces, setGoodPieces] = useState('');
  const [badPieces, setBadPieces] = useState('');

  useEffect(() => {
    const fetchStationAndMandrels = async () => {
      try {
        // Fetch station details
        const stationResponse = await fetch(`/api/autoclaves/${params.id}`);
        if (!stationResponse.ok) {
          throw new Error('Failed to fetch station details');
        }
        const stationData = await stationResponse.json();
        setStationName(stationData.stationName);

        // Fetch mandrels for this station
        const mandrelsResponse = await fetch(`/api/mandrels?stationName=${encodeURIComponent(stationData.stationName)}`);
        if (!mandrelsResponse.ok) {
          throw new Error('Failed to fetch mandrels');
        }
        const mandrelsData = await mandrelsResponse.json();
        setMandrels(mandrelsData);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStationAndMandrels();
  }, [params.id]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleMandrelSelect = (mandrel) => {
    setSelectedMandrel(mandrel);
    handleCloseModal();
  };

  const getMandrelColor = (status) => {
    switch (status) {
      case 'available':
        return theme.palette.success.main;
      case 'in-use':
        return theme.palette.error.main;
      case 'maintenance':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleGoodPiecesChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setGoodPieces(value);
    }
  };

  const handleBadPiecesChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setBadPieces(value);
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
          maxWidth: 800,
          borderRadius: 2,
          mx: 'auto'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" fontWeight="600">
            {stationName || 'Cargando...'}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{ 
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Seleccionar Mandril
          </Button>
        </Box>

        {selectedMandrel && (
          <>
            <Paper
              elevation={1}
              sx={{
                mt: 2,
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2,
                border: `2px solid ${getMandrelColor(selectedMandrel.status)}`,
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: getMandrelColor(selectedMandrel.status),
                    flexShrink: 0
                  }}
                />
                <Box>
                  <Typography variant="h6" component="div" gutterBottom>
                    Mandril Seleccionado
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="600" color="primary">
                    {selectedMandrel.mandrel}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Paper
              elevation={1}
              sx={{
                mt: 3,
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="h6" component="div" gutterBottom>
                Registro de Piezas
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Piezas Buenas"
                    value={goodPieces}
                    onChange={handleGoodPiecesChange}
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">pzas</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Piezas Malas"
                    value={badPieces}
                    onChange={handleBadPiecesChange}
                    type="text"
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">pzas</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </>
        )}

        {/* Mandrel Selection Modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="mandrel-selection-modal"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              maxWidth: 800,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 2,
              overflow: 'auto'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2,
              px: 1
            }}>
              <Typography variant="h6" component="h2">
                Seleccionar Mandril
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={1}>
              {mandrels.map((mandrel, index) => (
                <Grid item xs={4} sm={3} md={2} key={index}>
                  <Box
                    onClick={() => handleMandrelSelect(mandrel)}
                    sx={{
                      height: 80,
                      minWidth: 100,
                      border: `2px solid ${getMandrelColor(mandrel.status)}`,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: selectedMandrel?.mandrel === mandrel.mandrel 
                        ? `${getMandrelColor(mandrel.status)}20`
                        : 'transparent',
                      '&:hover': {
                        bgcolor: `${getMandrelColor(mandrel.status)}10`,
                      },
                      p: 1,
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography 
                        variant="subtitle2" 
                        component="div" 
                        noWrap
                        sx={{
                          color: getMandrelColor(mandrel.status),
                          fontWeight: selectedMandrel?.mandrel === mandrel.mandrel ? 600 : 400
                        }}
                      >
                        {mandrel.mandrel}
                      </Typography>
                      {selectedMandrel?.mandrel === mandrel.mandrel && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: getMandrelColor(mandrel.status)
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Modal>
      </Paper>
    </Box>
  );
} 