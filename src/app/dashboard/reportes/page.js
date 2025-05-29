'use client';

import { Box, Container, Typography, Paper, Grid, Button, TextField, MenuItem, Select, InputLabel, FormControl, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButtonGroup, ToggleButton } from '@mui/material';
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
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import TablePagination from '@mui/material/TablePagination';

export default function ReportesPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [defectSummary, setDefectSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [viewMode, setViewMode] = useState('main'); // 'main' or 'defects'

  useEffect(() => {
    const view = searchParams.get('view');
    if (view === 'defects') {
      setViewMode('defects');
    }
  }, [searchParams]);

  const handleChange = (field) => (event) => {
    setFilters({ ...filters, [field]: event.target.value });
  };

  const handleBuscar = async () => {
    if (!filters.desde || !filters.hasta) {
      toast.error('Selecciona ambas fechas.');
      return;
    }
    setLoading(true);
    setLoadingSummary(true);
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
      // Fetch defect summary
      const resSummary = await fetch(`/api/captures/defect-summary?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const dataSummary = await resSummary.json();
      if (Array.isArray(dataSummary)) {
        setDefectSummary(dataSummary);
      } else {
        setDefectSummary([]);
      }
    } catch (err) {
      setRows([]);
      setDefectSummary([]);
      toast.error('Error de red');
    } finally {
      setLoading(false);
      setLoadingSummary(false);
    }
  };

  // Filtering logic for main table
  const filteredRows = rows.filter(row => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (row.inspector || '').toLowerCase().includes(s) ||
      (row.station_name || '').toLowerCase().includes(s) ||
      (row.client || '').toLowerCase().includes(s) ||
      (row.mandrel || '').toLowerCase().includes(s) ||
      (row.sap_number || '').toLowerCase().includes(s) ||
      (row.sap_number_extrusion || '').toLowerCase().includes(s) ||
      (row.shift || '').toLowerCase().includes(s) ||
      (row.fecha_hora || '').toLowerCase().includes(s)
    );
  });

  // Filtering logic for defect summary
  const filteredDefectSummary = defectSummary.filter(row => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(row.defect_name || '').toLowerCase().includes(s) ||
      String(row.defect_id || '').toLowerCase().includes(s) ||
      String(row.mandrel || '').toLowerCase().includes(s) ||
      String(row.sap_number_extrusion || '').toLowerCase().includes(s)
    );
  });

  // Pagination logic
  const paginatedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const paginatedDefectSummary = filteredDefectSummary.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // CSV Download for main table
  const handleDownloadCSV = () => {
    if (viewMode === 'main' && filteredRows.length === 0) {
      toast.error('No hay datos para descargar');
      return;
    }
    if (viewMode === 'defects' && filteredDefectSummary.length === 0) {
      toast.error('No hay datos para descargar');
      return;
    }

    let headers = [];
    let csvRows = [];

    if (viewMode === 'main') {
      headers = [
        'Captura', 'Inspector', 'Autoclave', 'Cliente', 'Mandril', 'SAP Vulcanizado', 'SAP Extrusion', 'Piezas Buenas', 'Piezas Malas', 'Turno', 'Fecha'
      ];
      csvRows = [headers.join(',')];
      filteredRows.forEach(row => {
        csvRows.push([
          row.id,
          row.inspector,
          row.station_name,
          row.client,
          row.mandrel,
          row.sap_number,
          row.sap_number_extrusion,
          row.piezas_buenas,
          row.piezas_malas,
          row.shift,
          row.fecha_hora
        ].map(val => `"${val ?? ''}"`).join(','));
      });
    } else {
      headers = [
        'Autoclave', 'Defecto', 'Código', 'Mandril', 'SAP Extrusión', 'Turno', 'Fecha', 'Total Malas'
      ];
      csvRows = [headers.join(',')];
      filteredDefectSummary.forEach(row => {
        csvRows.push([
          row.station_name,
          row.defect_name,
          row.defect_code,
          row.mandrel,
          row.sap_number_extrusion,
          row.shift,
          row.fecha,
          row.total_malas
        ].map(val => `"${val ?? ''}"`).join(','));
      });
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `reporte_${viewMode === 'main' ? 'capturas' : 'defectos'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
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
        <Box sx={{ width: '100%' }}>
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

          {/* Filter/Search and Download */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="large"
              >
                <ToggleButton value="main" aria-label="main report">
                  Capturas
                </ToggleButton>
                <ToggleButton value="defects" aria-label="defect summary">
                  Resumen de Defectos
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <TextField
              placeholder="Buscar en la tabla..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ width: 350 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadCSV}
              sx={{ ml: 2 }}
            >
              Descargar CSV
            </Button>
          </Box>

          {/* Main Results Table */}
          {viewMode === 'main' && (
            <Paper elevation={2} sx={{ width: '100%', mt: 4 }}>
              <TableContainer sx={{ width: '100%' }}>
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
                    {filteredRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} align="center">Sin datos</TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((row) => (
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
              <TablePagination
                component="div"
                count={filteredRows.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Filas por página"
              />
            </Paper>
          )}

          {/* Defect Summary Table */}
          {viewMode === 'defects' && (
            <Paper elevation={2} sx={{ width: '100%', mt: 4 }}>
              <TableContainer sx={{ width: '100%' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Autoclave</TableCell>
                      <TableCell>Defecto</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Mandril</TableCell>
                      <TableCell>SAP Extrusión</TableCell>
                      <TableCell>Turno</TableCell>
                      <TableCell>Fecha</TableCell>
                      <TableCell align="right">Total Malas</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingSummary ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">Cargando...</TableCell>
                      </TableRow>
                    ) : filteredDefectSummary.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">Sin datos</TableCell>
                      </TableRow>
                    ) : (
                      paginatedDefectSummary.map((row, idx) => (
                        <TableRow key={row.defect_id + '-' + row.mandrel + '-' + row.sap_number_extrusion + '-' + idx}>
                          <TableCell>{row.station_name}</TableCell>
                          <TableCell>{row.defect_name}</TableCell>
                          <TableCell>{row.defect_code}</TableCell>
                          <TableCell>{row.mandrel}</TableCell>
                          <TableCell>{row.sap_number_extrusion}</TableCell>
                          <TableCell>{row.shift}</TableCell>
                          <TableCell>{row.fecha}</TableCell>
                          <TableCell align="right">{row.total_malas}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={filteredDefectSummary.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                labelRowsPerPage="Filas por página"
              />
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
} 