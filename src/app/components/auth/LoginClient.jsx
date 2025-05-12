'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Container,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '@/app/context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function LoginClient() {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, loginError } = useAuth();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId.trim()) {
      setError('Por favor ingrese su ID de empleado');
      return;
    }
    
    setIsLoading(true);
    setError('');

    // if employeeId starts with 120 remove the first 3 digits and last 1 digit, if it start with 12 and third digit is diifernt than 0 than remove the first 2 digits and last 1 digit
    let employeeIdFormatted = employeeId;
    if (employeeId.startsWith('120')) {
      employeeIdFormatted = employeeId.slice(3, -1);
    } else if (employeeId.startsWith('12') && employeeId[2] !== '0') {
      employeeIdFormatted = employeeId.slice(2, -1);
    }
    
    try {
      const result = await login(employeeIdFormatted.trim());
      if (result.success) {
        router.push('/dashboard/select-autoclave');
      } else {
        setEmployeeId('');
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 100%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 5 },
            width: '100%',
            maxWidth: 450,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, #FFD700)`,
            }
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box 
              sx={{ 
                width: 200, 
                height: 200, 
                position: 'relative',
                mb: -5,
                mt: -5
              }}
            >
              <img
                src="/tristone.png"
                alt="Tristone Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="600">
              T-CIV
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {(error || loginError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || loginError}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="ID de Empleado"
              variant="outlined"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              autoFocus
              disabled={isLoading}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              sx={{ 
                py: 1.5,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                }
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Ingresar'
              )}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
} 