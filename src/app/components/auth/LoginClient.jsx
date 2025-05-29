'use client';

import { useState, useRef } from 'react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const router = useRouter();
  const { login, loginError } = useAuth();
  const theme = useTheme();
  const inputRef = useRef();

  const handleKeypadClick = (val) => {
    if (val === 'clear') {
      setEmployeeId('');
    } else if (val === 'back') {
      setEmployeeId((prev) => prev.slice(0, -1));
    } else {
      setEmployeeId((prev) => prev + val);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdmin) {
      if (!adminUser.trim()) {
        setError('Por favor ingrese el usuario admin');
        return;
      }
      if (!adminPassword) {
        setError('Por favor ingrese la contraseña de admin');
        return;
      }
      if (adminPassword !== adminUser) {
        setError('Credenciales de admin inválidas');
        return;
      }
    } else {
      if (!employeeId.trim()) {
        setError('Por favor ingrese su ID de empleado');
        return;
      }
    }
    setIsLoading(true);
    setError('');
    let result;
    try {
      if (isAdmin) {
        result = await login(adminUser.trim(), true);
      } else {
        let employeeIdFormatted = employeeId;
        employeeIdFormatted = employeeIdFormatted.replace(/^0+/, '');
        if (employeeIdFormatted.startsWith('12')) {
          employeeIdFormatted = employeeIdFormatted.slice(2);
        }
        result = await login(employeeIdFormatted.trim(), false);
      }

      if (result.success) {
       
        if (result.permissions && result.permissions.includes('admin')) {
          router.push('/dashboard');
        } else {
          router.push('/dashboard/select-autoclave');
        }
      } else {
        setEmployeeId('');
        setAdminUser('');
        setAdminPassword('');
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadEnter = async () => {
    // Submit the form
    await handleSubmit({ preventDefault: () => {} });
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              variant={isAdmin ? 'contained' : 'outlined'}
              color="secondary"
              size="small"
              onClick={() => setIsAdmin((prev) => !prev)}
              sx={{ mr: 2 }}
            >
              {isAdmin ? 'Supervisor' : 'Inspector'}
            </Button>
            
          </Box>
          <Divider sx={{ mb: 3 }} />
          {(error || loginError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || loginError}
            </Alert>
          )}
          <form onSubmit={handleFormSubmit} autoComplete="off">
            {isAdmin ? (
              <>
                <TextField
                  fullWidth
                  label="Usuario"
                  variant="outlined"
                  value={adminUser}
                  onChange={(e) => {
                    setAdminUser(e.target.value);
                    setError('');
                  }}
                  error={!!error}
                  helperText={error}
                  autoFocus
                  disabled={isLoading}
                  sx={{ mb: 3 }}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  sx={{ mb: 3 }}
                  disabled={isLoading}
                />
              </>
            ) : (
              <>
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
                  inputRef={inputRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                    inputMode: 'none',
                    readOnly: true
                  }}
                />
              </>
            )}
            {!isAdmin && (
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
                    <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleKeypadClick(String(n))}>{n}</Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {[4,5,6].map(n => (
                    <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleKeypadClick(String(n))}>{n}</Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {[7,8,9].map(n => (
                    <Button key={n} variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleKeypadClick(String(n))}>{n}</Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleKeypadClick('back')}>&larr;</Button>
                  <Button variant="outlined" sx={{ width: 56, height: 56, fontSize: 24 }} onMouseDown={() => handleKeypadClick('0')}>0</Button>
                  <Button variant="contained" color="primary" sx={{ width: 56, height: 56, fontSize:15 }} onMouseDown={handleKeypadEnter}>Enter</Button>
                </Box>
              </Box>
            )}
            
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