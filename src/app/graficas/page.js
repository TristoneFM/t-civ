'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  useTheme
} from '@mui/material';
import Image from 'next/image';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function GraficasPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { currentShift: shift } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/graficas?shift=${shift}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (shift) {
      fetchData();
    }
  }, [shift]);

  if (loading) {
    return (
      <Box>
        <Navbar />
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={60} />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Navbar />
        <Box sx={{ p: 3 }}>
          <Typography color="error" fontSize="1.9rem">Error: {error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
            <Image
              src="/tristone.png"
              alt="Tristone Logo"
              width={300}
              height={150}
              priority
            />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="600" fontSize="2.5rem" color="primary" mb={5}>
            T-CIV Cumplimiento de Programación - TURNO {shift}
          </Typography>
          
          <TableContainer>
            <Table size="large">
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2
                    }}
                  >
                    Autoclave
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2
                    }}
                  >
                    Ciclos T-MES
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2
                    }}
                  >
                    Mandriles
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2
                    }}
                  >
                    Piezas Programadas
                  </TableCell>
                  <TableCell 
                    colSpan={3}
                    align="center"
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2
                    }}
                  >
                    Piezas Producidas
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.light,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 1.5
                    }}
                  >
                    Buenas
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.light,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 1.5
                    }}
                  >
                    Malas
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.light,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 1.5
                    }}
                  >
                    Total
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { 
                        bgcolor: 'action.hover' 
                      }
                    }}
                  >
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.autoclave}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.ciclosTMES}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.mandriles}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.piezasProgramadas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.piezasBuenas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.piezasMalas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2 }}>{row.piezasTotal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
} 