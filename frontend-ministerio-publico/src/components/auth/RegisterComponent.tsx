import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Link
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegisterForm, Fiscalia } from '../../types';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterComponentProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const schema: yup.ObjectSchema<FormData> = yup.object({
  nombreUsuario: yup.string().required('El nombre de usuario es obligatorio'),
  email: yup.string().email('Email inválido').required('El email es obligatorio'),
  password: yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Las contraseñas no coinciden').required('Confirmar contraseña es obligatorio'),
  primerNombre: yup.string().required('El primer nombre es obligatorio'),
  primerApellido: yup.string().required('El primer apellido es obligatorio'),
  segundoNombre: yup.string().optional(),
  segundoApellido: yup.string().optional(),
  idFiscalia: yup.number().min(1, 'Debe seleccionar una fiscalía').required('La fiscalía es obligatoria')
});

type FormData = RegisterForm & {
  confirmPassword: string;
};

const RegisterComponent: React.FC<RegisterComponentProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fiscalias, setFiscalias] = useState<Fiscalia[]>([]);
  const [loadingFiscalias, setLoadingFiscalias] = useState(true);
  const { loginWithToken } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      nombreUsuario: '',
      email: '',
      password: '',
      confirmPassword: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      idFiscalia: 0
    }
  });

  // Load fiscalías
  useEffect(() => {
    const loadFiscalias = async () => {
      try {
        setLoadingFiscalias(true);
        const response = await authService.getFiscalias();
        if (response.success && response.data) {
          setFiscalias(response.data);
        }
      } catch (err: any) {
        console.error('Error loading fiscalias:', err);
      } finally {
        setLoadingFiscalias(false);
      }
    };

    loadFiscalias();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      // Remove confirmPassword from data
      const { confirmPassword, ...registerData } = data;
      
      const response = await authService.register(registerData);
      
      if (response.success) {
        setSuccess(true);
        // Auto-login after successful registration
        setTimeout(async () => {
          try {
            const loginResponse = await authService.login({
              nombreUsuario: data.nombreUsuario,
              password: data.password
            });
            
            if (loginResponse.success && loginResponse.data) {
              loginWithToken(loginResponse.data.usuario, loginResponse.data.token);
              onSuccess?.();
            }
          } catch (err) {
            console.error('Auto-login failed:', err);
            // Still consider registration successful
            onSuccess?.();
          }
        }, 1000);
      } else {
        setError(response.message || 'Error en el registro');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado durante el registro');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Box textAlign="center">
              <Typography variant="h4" gutterBottom color="primary">
                ¡Registro Exitoso!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Tu cuenta ha sido creada exitosamente. Iniciando sesión...
              </Typography>
              <CircularProgress size={40} />
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        py={4}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom color="primary">
              Registro de Usuario
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema de Gestión - Ministerio Público
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              {/* User credentials */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="nombreUsuario"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre de Usuario *"
                      fullWidth
                      error={!!errors.nombreUsuario}
                      helperText={errors.nombreUsuario?.message}
                      disabled={loading}
                    />
                  )}
                />
                
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email *"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Stack>

              {/* Passwords */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contraseña *"
                      type="password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      disabled={loading}
                    />
                  )}
                />
                
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirmar Contraseña *"
                      type="password"
                      fullWidth
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Stack>

              {/* Personal information */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="primerNombre"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Primer Nombre *"
                      fullWidth
                      error={!!errors.primerNombre}
                      helperText={errors.primerNombre?.message}
                      disabled={loading}
                    />
                  )}
                />
                
                <Controller
                  name="segundoNombre"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Segundo Nombre"
                      fullWidth
                      error={!!errors.segundoNombre}
                      helperText={errors.segundoNombre?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="primerApellido"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Primer Apellido *"
                      fullWidth
                      error={!!errors.primerApellido}
                      helperText={errors.primerApellido?.message}
                      disabled={loading}
                    />
                  )}
                />
                
                <Controller
                  name="segundoApellido"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Segundo Apellido"
                      fullWidth
                      error={!!errors.segundoApellido}
                      helperText={errors.segundoApellido?.message}
                      disabled={loading}
                    />
                  )}
                />
              </Stack>

              {/* Fiscalía */}
              <Controller
                name="idFiscalia"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.idFiscalia}>
                    <InputLabel>Fiscalía *</InputLabel>
                    <Select
                      {...field}
                      label="Fiscalía *"
                      disabled={loading || loadingFiscalias}
                    >
                      <MenuItem value={0}>Seleccionar fiscalía</MenuItem>
                      {fiscalias.map((fiscalia) => (
                        <MenuItem key={fiscalia.idFiscalia} value={fiscalia.idFiscalia}>
                          {fiscalia.nombreFiscalia}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.idFiscalia && (
                      <Box color="error.main" fontSize="0.75rem" mt={0.5}>
                        {errors.idFiscalia.message}
                      </Box>
                    )}
                  </FormControl>
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || loadingFiscalias}
                startIcon={loading ? <CircularProgress size={20} /> : null}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </Button>

              <Box textAlign="center">
                <Typography variant="body2">
                  ¿Ya tienes una cuenta?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={onSwitchToLogin}
                    sx={{ textDecoration: 'none' }}
                  >
                    Iniciar Sesión
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterComponent;
