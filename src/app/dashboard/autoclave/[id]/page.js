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
  InputAdornment,
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DEFECT_OPTIONS = [
  'Ampollas', 'Contaminacion', 'Cortas', 'Corte angular',
  'Daño en mandril', 'Daño externo', 'Daño interno', 'ER Canal Interno',
  'ER Cubierta suelta', 'ER Diametro abierto', 'ER Diametro cerrado', 'ER Doble golpe de',
  'ER Encogimiento', 'ER espesor alto', 'ER espesor bajo', 'ER Grumos',
  'ER Longitud corta', 'ER Longitud larga', 'ER Mal Tejido', 'ER Marca de rodillo',
  'ER Porosidad de h', 'Falta de tapa', 'Largas', 'Marca de guante',
  'Material acumulad', 'Porosidad', 'Problema de mues', 'Punta dañada',
  'Rebaba', 'Ruptura en la curv', 'Ruptura en punta', 'SCRAP Auditorias',
  'Suciedad de Mand', 'Tapa corta', 'Tapa costilluda'
];

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
  const [selectedDefects, setSelectedDefects] = useState([]);

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

  const handleDefectClick = (defect) => {
    setSelectedDefects((prev) => {
      const found = prev.find((d) => d.name === defect);
      if (found) {
        return prev.map((d) => d.name === defect ? { ...d, count: d.count + 1 } : d);
      } else {
        return [...prev, { name: defect, count: 1 }];
      }
    });
    setBadPieces((prev) => (prev === '' ? '1' : String(Number(prev) + 1)));
  };

  const handleDefectDelete = (defectName) => {
    setSelectedDefects((prev) => prev.filter((d) => d.name !== defectName));
    const defect = selectedDefects.find((d) => d.name === defectName);
    if (defect) {
      setBadPieces((prev) => {
        const newVal = Number(prev) - defect.count;
        return newVal > 0 ? String(newVal) : '';
      });
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
          maxWidth: 'none',
          borderRadius: 2
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
              {selectedDefects.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedDefects.map((defect, idx) => (
                    <Chip
                      key={idx}
                      label={`${defect.name} x${defect.count}`}
                      color="error"
                      onDelete={() => handleDefectDelete(defect.name)}
                    />
                  ))}
                </Box>
              )}
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
                Seleccionar Defectos
              </Typography>
              <Grid container spacing={1}>
                {DEFECT_OPTIONS.map((defect, idx) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        width: 200,
                        height: 50,
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 200,
                        maxWidth: 200
                      }}
                      onClick={() => handleDefectClick(defect)}
                    >
                      {defect}
                    </Button>
                  </Grid>
                ))}
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
              maxWidth: 1200,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 3,
              overflow: 'auto'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              px: 1
            }}>
              <Typography variant="h6" component="h2">
                Seleccionar Mandril
              </Typography>
              <IconButton onClick={handleCloseModal} size="small">
                <CloseIcon />
              </IconButton>
            </Box>

            <Grid container spacing={2}>
              {mandrels.map((mandrel, index) => (
                <Grid item xs={3} sm={2} md={2} lg={1.5} key={index}>
                  <Box
                    onClick={() => handleMandrelSelect(mandrel)}
                    sx={{
                      height: 70,
                      minWidth: 150,
                      border: `3px solid ${theme.palette.primary.main}`,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: selectedMandrel?.mandrel === mandrel.mandrel 
                        ? `${theme.palette.primary.main}20`
                        : 'transparent',
                      '&:hover': {
                        bgcolor: `${theme.palette.primary.main}10`,
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s ease-in-out'
                      },
                      p: 2,
                      position: 'relative',
                      boxShadow: selectedMandrel?.mandrel === mandrel.mandrel 
                        ? `0 0 10px ${theme.palette.primary.main}40`
                        : 'none'
                    }}
                  >
                    <Box sx={{ 
                      textAlign: 'center',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5
                    }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        noWrap
                        sx={{
                          color: theme.palette.primary.main,
                          fontWeight: selectedMandrel?.mandrel === mandrel.mandrel ? 700 : 500,
                          fontSize: '1.25rem',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {mandrel.mandrel}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: getMandrelColor(mandrel.status),
                          display: 'block',
                          width: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {mandrel.status === 'available' ? 'Disponible' : 
                         mandrel.status === 'in-use' ? 'En Uso' : 
                         mandrel.status === 'maintenance' ? 'Mantenimiento' : 
                         mandrel.status}
                      </Typography>
                      {selectedMandrel?.mandrel === mandrel.mandrel && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: getMandrelColor(mandrel.status),
                            boxShadow: `0 0 8px ${getMandrelColor(mandrel.status)}`
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