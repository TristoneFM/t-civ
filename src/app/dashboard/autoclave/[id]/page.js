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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import PrintIcon from '@mui/icons-material/Print';
import { toast } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '@/app/context/AuthContext';

const DEFECT_OPTIONS = [
  { id: 1, name: 'Ampollas' },
  { id: 2, name: 'Contaminacion' },
  { id: 3, name: 'Cortas' },
  { id: 4, name: 'Corte angular' },
  { id: 5, name: 'Daño en mandril' },
  { id: 6, name: 'Daño externo' },
  { id: 7, name: 'Daño interno' },
  { id: 8, name: 'ER Canal Interno' },
  { id: 9, name: 'ER Cubierta suelta' },
  { id: 10, name: 'ER Diametro abierto' },
  { id: 11, name: 'ER Diametro cerrado' },
  { id: 12, name: 'ER Doble golpe de' },
  { id: 13, name: 'ER Encogimiento' },
  { id: 14, name: 'ER espesor alto' },
  { id: 15, name: 'ER espesor bajo' },
  { id: 16, name: 'ER Grumos' },
  { id: 17, name: 'ER Longitud corta' },
  { id: 18, name: 'ER Longitud larga' },
  { id: 19, name: 'ER Mal Tejido' },
  { id: 20, name: 'ER Marca de rodillo' },
  { id: 21, name: 'ER Porosidad de h' },
  { id: 22, name: 'Falta de tapa' },
  { id: 23, name: 'Largas' },
  { id: 24, name: 'Marca de guante' },
  { id: 25, name: 'Material acumulad' },
  { id: 26, name: 'Porosidad' },
  { id: 27, name: 'Problema de mues' },
  { id: 28, name: 'Punta dañada' },
  { id: 29, name: 'Rebaba' },
  { id: 30, name: 'Ruptura en la curv' },
  { id: 31, name: 'Ruptura en punta' },
  { id: 32, name: 'SCRAP Auditorias' },
  { id: 33, name: 'Suciedad de Mand' },
  { id: 34, name: 'Tapa corta' },
  { id: 35, name: 'Tapa costilluda' }
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
  const [clientName, setClientName] = useState('');
  const goodInputRef = useRef();
  const [isPrintSelected, setIsPrintSelected] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { employeeName, employeeId, currentShift } = useAuth();
  useEffect(() => {
    const fetchStation = async () => {
      try {
        // Fetch station details
        const stationResponse = await fetch(`/api/autoclaves/${params.id}`);
        if (!stationResponse.ok) {
          toast.error('Error al obtener detalles de la estación');
          return;
        }
        const stationData = await stationResponse.json();
        setStationName(stationData.stationName);
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Ocurrió un error inesperado');
      } finally {
        setLoading(false);
      }
    };
    fetchStation();
  }, [params.id]);

  const handleOpenModal = async () => {
    setOpenModal(true);
    if (mandrels.length === 0 && stationName) {
      try {
        const mandrelsResponse = await fetch(`/api/mandrels?stationName=${encodeURIComponent(stationName)}`);
        if (!mandrelsResponse.ok) {
          toast.error('No se encontraron mandriles para esta estación');
          return;
        }
        const mandrelsData = await mandrelsResponse.json();
        setMandrels(mandrelsData);
      } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Ocurrió un error inesperado');
      }
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleMandrelSelect = async (mandrel) => {
    // Reset all form fields
    setGoodPieces('');
    setBadPieces('');
    setSelectedDefects([]);
    setIsPrintSelected(false);
    
    // Set the new mandrel
    setSelectedMandrel(mandrel);
    handleCloseModal();
    
    try {
      const response = await fetch(`/api/mandrels/client?sapNumber=P${mandrel.reference}`);
      const data = await response.json();
      setClientName(data.client);
    } catch (error) {
      console.error('Error fetching client details:', error);
      toast.error('Error al obtener detalles del cliente');
      setClientName('No disponible');
    }
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

  const handlePrintToggle = () => {
    setIsPrintSelected(!isPrintSelected);
  };

  const handleGuardarClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    if (isPrintSelected) {
      // Save first, then print, then show success modal
      const saveResult = await handleSaveOnly(true); // pass flag to not show modal yet
      if (saveResult) {
        handlePrintLabel();
        setSuccessOpen(true);
      }
    } else {
      await handleSaveOnly();
    }
  };

  const handleSaveOnly = async (noModal) => {
    try {
      const inspector = employeeId; // Replace with dynamic value if needed
      const now = new Date();
      const pad = (n) => n.toString().padStart(2, '0');
      const fecha_hora = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const defects = selectedDefects.map(d => {
        const defectObj = DEFECT_OPTIONS.find(opt => opt.name === d.name);
        return defectObj ? { defect_id: defectObj.id, defect_count: d.count } : null;
      }).filter(Boolean);
      const payload = {
        station_name: stationName,
        mandrel: selectedMandrel?.mandrel || '',
        client: clientName,
        sap_number: selectedMandrel?.reference || '',
        inspector,
        fecha_hora,
        piezas_buenas: Number(goodPieces) || 0,
        piezas_malas: Number(badPieces) || 0,
        defects,
        shift: currentShift
      };
      const response = await fetch('/api/captures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        if (!noModal) setSuccessOpen(true);
        return true;
      } else {
        setErrorMsg(data.error || 'Error al guardar los datos');
        setErrorOpen(true);
        return false;
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setErrorMsg('Error al guardar los datos');
      setErrorOpen(true);
      return false;
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    // Reset form state
    setSelectedMandrel(null);
    setClientName('');
    setGoodPieces('');
    setBadPieces('');
    setSelectedDefects([]);
    setIsPrintSelected(false);
  };

  const handleErrorClose = () => {
    setErrorOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const handlePrintLabel = () => {
    const inspector = 'Eduardo'; // You can replace this with dynamic data if needed
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const sap = selectedMandrel?.reference || '';
    const client = clientName || '';
    const mandrel = selectedMandrel?.mandrel || '';
    const station = stationName || '';
    const labelHTML = `
      <html>
      <head>
        <title>Etiqueta</title>
        <style>
          body { margin: 0; padding: 0; }
          .label-container {
            width: 260px;
            border: 1px solid #2196f3;
            padding: 12px 8px;
            font-family: Arial, sans-serif;
            margin: 24px auto;
          }
          .logo {
            display: flex;
            justify-content: center;
            margin-bottom: 4px;
          }
          .main-sap {
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            margin: 0;
            color: #222;
          }
          .client {
            font-size: 1rem;
            text-align: center;
            margin-bottom: 8px;
            color: #222;
          }
          .section {
            font-size: 0.95rem;
            margin-bottom: 4px;
            text-align: left;
          }
          .barcode {
            margin: 8px 0 4px 0;
            text-align: center;
          }
          .barcode img {
            width: 180px;
            height: 40px;
          }
          .footer {
            font-size: 0.85rem;
            margin-top: 8px;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Tristone_Flowtech_Group_logo.png" alt="Logo" style="height:32px;"/>
          </div>
          <div style="text-align:center;font-size:1.1rem;">${station}</div>
          <div class="main-sap">${mandrel}</div>
          <div class="client">Cliente: <b>${client}</b></div>
          <div class="section">Estampado: 1<br/>Área de Muesca:<br/>Prueba de Fuga:</div>
          <div class="section">SAP: ${sap}<br/>SAP: 5V${sap}</div>
          <div class="barcode">
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${sap}&code=Code128&translate-esc=false" alt="barcode" />
          </div>
          <div class="footer">
            Inspector: ${inspector}<br/>
            Fecha/Hora: ${dateStr}
          </div>
        </div>
        <script>window.onload = function() { window.print(); };</script>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.open();
    printWindow.document.write(labelHTML);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    // Error UI is now handled by toast notifications
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
              fontWeight: 400
            }}
            color="success"
            size="large"
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
                  {clientName}
                </Typography>
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold' }} color="text.secondary">
                  SAP Number
                </Typography>
                <Typography variant="h4" component="div" fontWeight="600" color="primary" sx={{ mb: 2 }}>
                  {selectedMandrel?.reference || 'No disponible'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="large" 
                    onClick={handleGuardarClick}
                    disabled={!(Number(goodPieces) > 0 || Number(badPieces) > 0)}
                  >
                    Guardar
                  </Button>
                  {/* Print button temporarily disabled
                  <IconButton 
                    onClick={handlePrintToggle}
                    sx={{ 
                      color: isPrintSelected ? 'success.main' : 'grey.500',
                      '&:hover': {
                        color: isPrintSelected ? 'success.dark' : 'grey.700'
                      }
                    }}
                  >
                    <PrintIcon fontSize="large" />
                  </IconButton>
                  */}
                </Box>
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
                const found = selectedDefects.find((d) => d.name === defect.name);
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
                        onClick={() => handleDefectClick(defect.name)}
                      >
                        {count > 0 ? `(${count}) ` : ''}{defect.name}
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
                            handleDefectDelete(defect.name);
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
              {mandrels.length > 0 && mandrels.map((mandrel, index) => (
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

        {/* Confirmation Modal */}
        <Dialog open={confirmOpen} onClose={handleCancel}>
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              {isPrintSelected
                ? '¿Estás seguro de que deseas guardar y generar la etiqueta?'
                : '¿Estás seguro de que deseas guardar los datos?'}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
              <Typography sx={{ fontSize: '1.3rem', color: 'primary.main' }}>
                Piezas Buenas: <span style={{ fontWeight: 500 }}>{goodPieces || 0}</span>
              </Typography>
              <Typography sx={{ fontSize: '1.3rem', color: 'error.main' }}>
                Piezas Malas: <span style={{ fontWeight: 500 }}>{badPieces || 0}</span>
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancel} color="inherit">Cancelar</Button>
            <Button onClick={handleConfirm} color="success" variant="contained">Confirmar</Button>
          </DialogActions>
        </Dialog>

        {/* Success Modal */}
        <Dialog
          open={successOpen}
          onClose={handleSuccessClose}
          aria-labelledby="success-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="success-dialog-title" sx={{ textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h5" component="div">
              ¡Guardado Exitoso!
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              Los datos se guardaron correctamente.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={handleSuccessClose} 
              color="primary" 
              variant="contained"
              size="large"
              sx={{ minWidth: '150px' }}
            >
              Continuar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Modal */}
        <Dialog
          open={errorOpen}
          onClose={handleErrorClose}
          aria-labelledby="error-dialog-title"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle id="error-dialog-title" sx={{ textAlign: 'center' }}>
            <CancelIcon color="error" sx={{ fontSize: 60, mb: 1 }} />
            <Typography variant="h5" component="div">
              Error al Guardar
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
              Algunos seriales no se guardaron correctamente. Por favor verifique todos los seriales escaneados.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button 
              onClick={handleErrorClose} 
              color="primary" 
              variant="contained"
              size="large"
              sx={{ minWidth: '150px' }}
            >
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
} 