import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Usuario } from '../types';

const PerfilPage: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authService.getProfile();
        if (response.success && response.data) {
          setUsuario(response.data);
        } else {
          setError(response.message || 'No se pudo obtener el perfil');
        }
      } catch (err: any) {
        setError(err.message || 'Error al obtener el perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleVolver = () => {
    window.history.length > 1 ? window.history.back() : navigate('/dashboard');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={handleVolver}>
          Volver
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Mi Perfil
        </Typography>
      </Stack>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : usuario ? (
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>Datos del Usuario</Typography>
          <Stack spacing={1}>
            <Typography><b>Nombre:</b> {usuario.primerNombre} {usuario.segundoNombre} {usuario.primerApellido} {usuario.segundoApellido}</Typography>
            <Typography><b>Usuario:</b> {usuario.nombreUsuario}</Typography>
            <Typography><b>Email:</b> {usuario.email}</Typography>
            <Typography><b>Fiscalía:</b> {usuario.fiscalia?.nombreFiscalia || usuario.idFiscalia}</Typography>
            <Typography><b>Rol:</b> {usuario.rol?.nombreRol}</Typography>
            <Typography><b>Activo:</b> {usuario.activo ? 'Sí' : 'No'}</Typography>
            <Typography><b>Fecha de creación:</b> {usuario.fechaCreacion}</Typography>
          </Stack>
        </Paper>
      ) : null}
    </Box>
  );
};

export default PerfilPage;
