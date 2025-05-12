'use client';

import { useState, useEffect, useRef } from 'react';
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
import Image from 'next/image';

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
  const [showGoodKeypad, setShowGoodKeypad] = useState(false);
  const goodInputRef = useRef();

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

  const handleGoodPiecesFocus = () => setShowGoodKeypad(true);
  const handleGoodKeypadEnter = () => setShowGoodKeypad(false);

  const handleGoodKeypadClick = (val) => {
    if (val === 'clear') {
      setGoodPieces('');
    } else if (val === 'back') {
      setGoodPieces((prev) => prev.slice(0, -1));
    } else {
      setGoodPieces((prev) => (prev === '0' ? val : prev + val));
    }
    if (goodInputRef.current) goodInputRef.current.focus();
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, alignItems: 'center' }}>
          <Typography variant="h3" component="h1" fontWeight="600" color="primary" align="center">
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
          <Grid container spacing={3}>
            {/* Left: Mandril Seleccionado and Piezas */}
            <Grid item xs={4} sx={{ flex: '1 1 0', minWidth: 0 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  border: `2px solid ${getMandrelColor(selectedMandrel.status)}`,
                  position: 'relative',
                  height: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%'
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
                <Paper
                  elevation={0}
                  sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  {/* Labels row */}
                  <Grid container spacing={18} sx={{ mb: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }} color="primary">
                        Piezas Buenas
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }} color="error">
                        Piezas Malas
                      </Typography>
                    </Grid>
                  </Grid>
                  {/* Inputs row */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label=""
                        value={goodPieces}
                        onChange={handleGoodPiecesChange}
                        type="text"
                        inputProps={{ inputMode: 'none', pattern: '[0-9]*', readOnly: true }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">pzas</InputAdornment>,
                        }}
                        inputRef={goodInputRef}
                        onFocus={handleGoodPiecesFocus}
                      />
                      {showGoodKeypad && (
                        <Box sx={{ 
                          mt: 1, 
                          mb: 2, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          position: 'relative',
                          zIndex: 1000
                        }}>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {[1,2,3].map(n => (
                              <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleGoodKeypadClick(String(n))}>{n}</Button>
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {[4,5,6].map(n => (
                              <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleGoodKeypadClick(String(n))}>{n}</Button>
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            {[7,8,9].map(n => (
                              <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleGoodKeypadClick(String(n))}>{n}</Button>
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                            <Button variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleGoodKeypadClick('back')}>&larr;</Button>
                            <Button variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleGoodKeypadClick('0')}>0</Button>
                            <Button variant="contained" color="success" sx={{ width: 56, height: 56, fontSize:15 }} onMouseDown={handleGoodKeypadEnter}>Enter</Button>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label=""
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
              </Paper>
            </Grid>
            {/* Center: Cliente, SAP Number, Guardar */}
            <Grid item xs={4} sx={{ flex: '1 1 0', minWidth: 0 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  height: 350,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  width: '100%'
                }}
              >
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }} color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="h4" component="div" fontWeight="600" color="primary" sx={{ mb: 2 }}>
                  {/* Replace with actual client value if available */}
                  Ejemplo Cliente
                </Typography>
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }} color="text.secondary">
                  SAP Number
                </Typography>
                <Typography variant="h4" component="div" fontWeight="600" color="primary" sx={{ mb: 2 }}>
                  {/* Replace with actual SAP number if available */}
                  12345678
                </Typography>
                <Button variant="contained" color="success" size="large">
                  Guardar
                </Button>
              </Paper>
            </Grid>
            {/* Right: Image */}
            <Grid item xs={4} sx={{ flex: '1 1 0', minWidth: 0 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                  height: 350,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  width: '100%'
                }}
              >
                <Image
                  src="/tristone.png"
                  alt="Vista de referencia"
                  width={350}
                  height={350}
                  style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: 350 }}
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                    e.target.onerror = null;
                  }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Defectos section restored below the split */}
        {selectedMandrel && (
          <Paper
            elevation={1}
            sx={{
              mt: 3,
              p: 3,
              bgcolor: 'background.default',
              borderRadius: 2,
              width: '100%',
              maxWidth: 'none',
              marginTop: showGoodKeypad ? '200px' : '24px',
              transition: 'margin-top 0.3s ease'
            }}
          >
            <Typography variant="h6" component="div" gutterBottom>
              Seleccionar Defectos
            </Typography>
            <Grid container spacing={1}>
              {DEFECT_OPTIONS.map((defect, idx) => {
                const found = selectedDefects.find((d) => d.name === defect);
                const count = found ? found.count : 0;
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={idx}>
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      <Button
                        variant="contained"
                        color={count > 0 ? 'error' : 'primary'}
                        fullWidth
                        sx={{
                          width: 250,
                          height: 100,
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
                        {count > 0 ? `(${count}) ` : ''}{defect}
                      </Button>
                      {count > 0 && (
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            right: 4,
                            top: 4,
                            zIndex: 2,
                            bgcolor: 'white',
                            color: 'error.main',
                            border: '1px solid',
                            borderColor: 'error.main',
                            p: 0.5
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDefectDelete(defect);
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
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