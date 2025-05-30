import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  Gavel,
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

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.nombreUsuario, data.password);
      navigate('/dashboard');
    } catch (error) {
      // El error ya se maneja en el contexto
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
              <Alert severity="error" sx={{ mb: 2 }}>
                {authState.error}
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
                disabled={isSubmitting || authState.loading}
              >
                {isSubmitting || authState.loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>

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
