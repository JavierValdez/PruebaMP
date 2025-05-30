import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Link,
  Divider,
  CircularProgress,
  Collapse,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Gavel,
  ErrorOutline,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../types';

// Esquema de validación
const schema = yup.object({
  nombreUsuario: yup
    .string()
    .required('El nombre de usuario es requerido')
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const LoginComponent: React.FC = () => {
  const { state: authState, login, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombreUsuario: '',
      password: '',
    },
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, authState.loading, navigate]);

  // Limpiar errores al montar el componente
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Manejo del bloqueo temporal por intentos fallidos
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBlocked && blockTimeRemaining > 0) {
      interval = setInterval(() => {
        setBlockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBlocked, blockTimeRemaining]);

  const getErrorMessage = (error: string): { message: string; severity: 'error' | 'warning' | 'info' } => {
    if (error.toLowerCase().includes('usuario') || error.toLowerCase().includes('username')) {
      return {
        message: 'Usuario no encontrado. Verifica que el nombre de usuario sea correcto.',
        severity: 'error'
      };
    }
    if (error.toLowerCase().includes('password') || error.toLowerCase().includes('contraseña')) {
      return {
        message: 'Contraseña incorrecta. Si has olvidado tu contraseña, puedes recuperarla.',
        severity: 'warning'
      };
    }
    if (error.toLowerCase().includes('blocked') || error.toLowerCase().includes('bloqueado')) {
      return {
        message: 'Cuenta temporalmente bloqueada por múltiples intentos fallidos.',
        severity: 'error'
      };
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('conexión')) {
      return {
        message: 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
        severity: 'warning'
      };
    }
    return {
      message: error || 'Error desconocido al iniciar sesión',
      severity: 'error'
    };
  };

  const onSubmit = async (data: LoginForm) => {
    if (isBlocked) {
      return;
    }

    try {
      await login(data.nombreUsuario, data.password);
      setLoginAttempts(0);
      navigate('/dashboard');
    } catch (error: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      // Bloquear después de 5 intentos fallidos
      if (newAttempts >= 5) {
        setIsBlocked(true);
        setBlockTimeRemaining(300); // 5 minutos
      }

      // Agregar errores específicos al formulario si es necesario
      if (error.message.toLowerCase().includes('usuario')) {
        setFormError('nombreUsuario', {
          type: 'manual',
          message: 'Usuario no encontrado'
        });
      } else if (error.message.toLowerCase().includes('password')) {
        setFormError('password', {
          type: 'manual',
          message: 'Contraseña incorrecta'
        });
      }

      console.error('Error en login:', error);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (authState.loading) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography>Cargando...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Gavel sx={{ fontSize: 40, color: 'white' }} />
                </Box>
              </Box>
              <Typography component="h1" variant="h4" fontWeight="bold" color="primary">
                Ministerio Público
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Sistema de Gestión de Casos
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Mensaje de error */}
            {authState.error && (
              <Collapse in={!!authState.error}>
                <Alert 
                  severity={getErrorMessage(authState.error).severity} 
                  sx={{ mb: 2 }}
                  icon={<ErrorOutline />}
                >
                  {getErrorMessage(authState.error).message}
                </Alert>
              </Collapse>
            )}

            {/* Mensaje de bloqueo temporal */}
            {isBlocked && (
              <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorOutline />}>
                Cuenta bloqueada temporalmente por múltiples intentos fallidos.
                <br />
                Tiempo restante: {Math.floor(blockTimeRemaining / 60)}:{(blockTimeRemaining % 60).toString().padStart(2, '0')}
              </Alert>
            )}

            {/* Advertencia por intentos fallidos */}
            {loginAttempts > 0 && loginAttempts < 5 && !authState.error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Intento fallido {loginAttempts} de 5. {5 - loginAttempts} intentos restantes.
              </Alert>
            )}

            {/* Formulario */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Controller
                name="nombreUsuario"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="nombreUsuario"
                    label="Usuario"
                    autoComplete="username"
                    autoFocus
                    error={!!errors.nombreUsuario}
                    helperText={errors.nombreUsuario?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color={errors.nombreUsuario ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color={errors.password ? 'error' : 'action'} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleTogglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isSubmitting || authState.loading || isBlocked}
              >
                {isSubmitting || authState.loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Iniciando sesión...
                  </>
                ) : isBlocked ? (
                  `Bloqueado (${Math.floor(blockTimeRemaining / 60)}:${(blockTimeRemaining % 60).toString().padStart(2, '0')})`
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2">
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/register" variant="body2">
                  ¿No tienes una cuenta? Regístrate aquí
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © 2025 Ministerio Público. Todos los derechos reservados.
        </Typography>
      </Box>
    </Container>
  );
};
