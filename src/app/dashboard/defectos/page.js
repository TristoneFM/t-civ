'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  TablePagination
} from '@mui/material';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';

export default function DefectosPage() {
  const theme = useTheme();
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);
  const [formData, setFormData] = useState({
    defect_code: '',
    description: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchDefects();
  }, []);

  const fetchDefects = async () => {
    try {
      const res = await fetch('/api/defects');
      const data = await res.json();
      setDefects(data);
    } catch (err) {
      toast.error('Error al cargar los defectos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (defect = null) => {
    if (defect) {
      setEditingDefect(defect);
      setFormData({
        defect_code: defect.defect_code,
        description: defect.description
      });
    } else {
      setEditingDefect(null);
      setFormData({
        defect_code: '',
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDefect(null);
    setFormData({
      defect_code: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDefect 
        ? `/api/defects/${editingDefect.id}`
        : '/api/defects';
      
      const method = editingDefect ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar el defecto');

      toast.success(editingDefect ? 'Defecto actualizado' : 'Defecto creado');
      handleCloseDialog();
      fetchDefects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este defecto?')) return;

    try {
      const res = await fetch(`/api/defects/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar el defecto');

      toast.success('Defecto eliminado');
      fetchDefects();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedDefects = defects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
              Gestión de Defectos
            </Typography>
          </Box>

          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Agregar Defecto
            </Button>
          </Box>

          <Paper elevation={2} sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">Cargando...</TableCell>
                    </TableRow>
                  ) : defects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">No hay defectos registrados</TableCell>
                    </TableRow>
                  ) : (
                    paginatedDefects.map((defect) => (
                      <TableRow key={defect.id}>
                        <TableCell>{defect.defect_code}</TableCell>
                        <TableCell>{defect.description}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(defect)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(defect.id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={defects.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              labelRowsPerPage="Filas por página"
            />
          </Paper>
        </Box>
      </Container>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDefect ? 'Editar Defecto' : 'Agregar Defecto'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Código"
              fullWidth
              value={formData.defect_code}
              onChange={(e) => setFormData({ ...formData, defect_code: e.target.value })}
              required
              disabled={!!editingDefect}
            />
            <TextField
              margin="dense"
              label="Descripción"
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingDefect ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 