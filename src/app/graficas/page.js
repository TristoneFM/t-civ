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
      // Initial fetch
      fetchData();
      
      // Set up polling every 10 seconds
      const intervalId = setInterval(fetchData, 10000);
      
      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
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
                      py: 2,
                      textAlign: 'center'
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
                      py: 2,
                      textAlign: 'center'
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
                      py: 2,
                      textAlign: 'center'
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
                      py: 2,
                      textAlign: 'center'
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
                      py: 2,
                      textAlign: 'center'
                    }}
                  >
                    Piezas Producidas
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '1.9rem',
                      py: 2,
                      textAlign: 'center'
                    }}
                  >
                    % Cumplimiento
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
                      py: 1.5,
                      textAlign: 'center'
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
                      py: 1.5,
                      textAlign: 'center'
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
                      py: 1.5,
                      textAlign: 'center'
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
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.autoclave}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.ciclosTMES}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.mandriles}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.piezasProgramadas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.piezasBuenas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.piezasMalas}</TableCell>
                    <TableCell sx={{ fontSize: '1.9rem', py: 2, textAlign: 'center' }}>{row.piezasTotal}</TableCell>
                    <TableCell 
                      sx={{ 
                        fontSize: '1.9rem', 
                        py: 2, 
                        textAlign: 'center',
                        color: 'white',                
                        bgcolor: (() => {
                          const percentage = row.piezasProgramadas > 0 
                            ? Math.round((row.piezasTotal / row.piezasProgramadas) * 100)
                            : 0;
                          if (percentage >= 95) return '#4caf50'; // green
                          if (percentage >= 85) return '#ffeb3b'; // yellow
                          return '#f44336'; // red
                        })()
                      }}
                    >
                      {row.piezasProgramadas > 0 
                        ? `${Math.round((row.piezasTotal / row.piezasProgramadas) * 100)}%`
                        : '0%'}
                    </TableCell>
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