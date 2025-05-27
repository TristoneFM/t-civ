'use client';

import { Box, Container, Typography, Paper, Grid, Button, TextField, MenuItem, Select, InputLabel, FormControl, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function ReportesPage() {
  const theme = useTheme();
  const [filters, setFilters] = useState({
    desde: '',
    hasta: '',
    pot: '',
    grupo: '',
    cliente: '',
    mandril: '',
    turno: '',
    usuario: '',
    defect: ''
  });

  // Example options
  const potOptions = ['Pot 1', 'Pot 2'];
  const grupoOptions = ['Grupo A', 'Grupo B'];
  const clienteOptions = ['Cliente 1', 'Cliente 2'];
  const mandrilOptions = ['Mandril 1', 'Mandril 2'];
  const turnoOptions = ['Turno 1', 'Turno 2'];
  const usuarioOptions = ['Usuario 1', 'Usuario 2'];
  const defectOptions = ['Defecto 1', 'Defecto 2'];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleBuscar = async () => {
    if (!filters.desde || !filters.hasta) {
      toast.error('Selecciona ambas fechas.');
      return;
    }
    setLoading(true);
    try {
      const start = filters.desde + ' 00:00:00';
      const end = filters.hasta + ' 23:59:59';
      const res = await fetch(`/api/captures/report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRows(data);
      } else {
        setRows([]);
        toast.error(data.error || 'Error al buscar reportes');
      }
    } catch (err) {
      setRows([]);
      toast.error('Error de red');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 8
      }}
    >
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 3, md: 6 } }}>
        <Box sx={{ width: { xs: '100%', md: '75%' }, maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                sx={{
                  color: 'black',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Volver
              </Button>
            </Link>
            <Typography variant="h3" component="h1" color="black" fontWeight="600" gutterBottom>
              Reportes
            </Typography>
            <Typography variant="h6" color="black" sx={{ opacity: 0.9 }}>
              Seleccione el tipo de reporte
            </Typography>
          </Box>

          {/* Filter Form */}
          <Paper elevation={2} sx={{ p: 3, mb: 4, width: '100%' }}>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Desde"
                  type="date"
                  value={filters.desde}
                  onChange={handleChange('desde')}
                  InputLabelProps={{ shrink: true, sx: { fontSize: 18 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: { height: 56, fontSize: 18, minWidth: 300, maxWidth: 300 }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Hasta"
                  type="date"
                  value={filters.hasta}
                  onChange={handleChange('hasta')}
                  InputLabelProps={{ shrink: true, sx: { fontSize: 18 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon color="primary" />
                      </InputAdornment>
                    ),
                    sx: { height: 56, fontSize: 18, minWidth: 300, maxWidth: 300 }
                  }}
                />
              </Grid>
              {/*
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Seleccione Pot</InputLabel>
                  <Select
                    value={filters.pot}
                    label="Seleccione Pot"
                    onChange={handleChange('pot')}
                    startAdornment={
                      <InputAdornment position="start">
                        <SettingsIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Seleccione Pot--</em></MenuItem>
                    {potOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Select Grupo</InputLabel>
                  <Select
                    value={filters.grupo}
                    label="Select Grupo"
                    onChange={handleChange('grupo')}
                    startAdornment={
                      <InputAdornment position="start">
                        <GroupIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Select Grupo--</em></MenuItem>
                    {grupoOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Seleccione Cliente</InputLabel>
                  <Select
                    value={filters.cliente}
                    label="Seleccione Cliente"
                    onChange={handleChange('cliente')}
                    startAdornment={
                      <InputAdornment position="start">
                        <DirectionsCarIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Seleccione Cliente--</em></MenuItem>
                    {clienteOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Seleccione Mandril</InputLabel>
                  <Select
                    value={filters.mandril}
                    label="Seleccione Mandril"
                    onChange={handleChange('mandril')}
                    startAdornment={
                      <InputAdornment position="start">
                        <PrecisionManufacturingIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Seleccione Mandril--</em></MenuItem>
                    {mandrilOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Seleccione Turno</InputLabel>
                  <Select
                    value={filters.turno}
                    label="Seleccione Turno"
                    onChange={handleChange('turno')}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Seleccione Turno--</em></MenuItem>
                    {turnoOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Seleccione Usuario</InputLabel>
                  <Select
                    value={filters.usuario}
                    label="Seleccione Usuario"
                    onChange={handleChange('usuario')}
                    startAdornment={
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Seleccione Usuario--</em></MenuItem>
                    {usuarioOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="large" sx={{ minWidth: 300, maxWidth: 300 }}>
                  <InputLabel sx={{ fontSize: 18 }}>Select Defect</InputLabel>
                  <Select
                    value={filters.defect}
                    label="Select Defect"
                    onChange={handleChange('defect')}
                    startAdornment={
                      <InputAdornment position="start">
                        <CancelIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: 56, fontSize: 18 }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          minWidth: 300
                        }
                      },
                      anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
                      transformOrigin: { vertical: 'top', horizontal: 'left' }
                    }}
                  >
                    <MenuItem value="" sx={{ fontSize: 18, height: 48 }}><em>--Select Defect--</em></MenuItem>
                    {defectOptions.map((opt) => (
                      <MenuItem key={opt} value={opt} sx={{ fontSize: 18, height: 48 }}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" color="primary"
                    onClick={handleBuscar}
                    disabled={loading}
                  >
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Table */}
          <Paper elevation={2} sx={{ width: '100%', mt: 4 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Captura</TableCell>
                    <TableCell>Inspector</TableCell>
                    <TableCell>Autoclave</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Mandril</TableCell>
                    <TableCell>SAP Vulcanizado</TableCell>
                    <TableCell>SAP Extrusion</TableCell>
                    <TableCell>Piezas Buenas</TableCell>
                    <TableCell>Piezas Malas</TableCell>
                    <TableCell>Turno</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">Sin datos</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.inspector}</TableCell>
                        <TableCell>{row.station_name}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell>{row.mandrel}</TableCell>
                        <TableCell>{row.sap_number}</TableCell>
                        <TableCell>{row.sap_number_extrusion}</TableCell>
                        <TableCell>{row.piezas_buenas}</TableCell>
                        <TableCell>{row.piezas_malas}</TableCell>
                        <TableCell>{row.shift}</TableCell>
                        <TableCell>{row.fecha_hora}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
} 