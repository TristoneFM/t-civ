'use client';

import { Box, Button, Container, Grid, Paper, Typography, useTheme } from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AutoclaveIcon from '@mui/icons-material/Factory';
import Link from 'next/link';

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 8,
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" color="black" fontWeight="600" gutterBottom>
            T-CIV
          </Typography>
          <Typography variant="h6" color="black" sx={{ opacity: 0.9 }}>
            Seleccione una opción
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Link href="/dashboard/select-autoclave" style={{ textDecoration: 'none' }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <AutoclaveIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                  Autoclave
                </Typography>
                <Typography color="text.secondary" align="center">
                  Captura de datos de autoclave
                </Typography>
              </Paper>
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Link href="/dashboard/reportes" style={{ textDecoration: 'none' }}>
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: theme.palette.secondary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                  }}
                >
                  <AssessmentIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="600">
                  Reportes
                </Typography>
                <Typography color="text.secondary" align="center">
                  Visualización y generación de reportes
                </Typography>
              </Paper>
            </Link>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 