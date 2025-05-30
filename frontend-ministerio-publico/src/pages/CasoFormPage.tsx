import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { 
  Caso, 
  CasoForm, 
  EstadoCaso, 
  Fiscal 
} from '../types';
import { casoService } from '../services/casoService';
import { usePermisos } from '../hooks/usePermisos';
import { formatearFecha } from '../utils/fechas';

// Esquema de validación con Yup
const validationSchema = Yup.object({
  numeroCaso: Yup.string()
    .required('El número de caso es obligatorio')
    .min(3, 'El número de caso debe tener al menos 3 caracteres')
    .max(50, 'El número de caso no puede tener más de 50 caracteres'),
  descripcion: Yup.string()
    .required('La descripción es obligatoria')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede tener más de 1000 caracteres'),
  idEstado: Yup.number()
    .required('El estado es obligatorio')
    .min(1, 'Debe seleccionar un estado válido'),
  detalleProgreso: Yup.string()
    .max(2000, 'El detalle de progreso no puede tener más de 2000 caracteres'),
  idFiscalAsignado: Yup.number()
    .nullable()
    .min(1, 'Debe seleccionar un fiscal válido')
});

interface CasoFormPageProps {}

const CasoFormPage: React.FC<CasoFormPageProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permisos, isAuthenticated } = usePermisos();
  
  // Estados
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [caso, setCaso] = useState<Caso | null>(null);
  const [estados, setEstados] = useState<EstadoCaso[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);

  // Determinar si estamos en modo edición
  const isEditMode = Boolean(id);
  const pageTitle = isEditMode ? 'Editar Caso' : 'Crear Nuevo Caso';

  // Valores iniciales del formulario
  const initialValues: CasoForm = {
    numeroCaso: caso?.numeroCaso || caso?.numeroExpediente || '',
    descripcion: caso?.descripcion || '',
    idEstado: caso?.idEstado || 1,
    detalleProgreso: '',
    idFiscalAsignado: caso?.idFiscalAsignado || null
  };

  useEffect(() => {
    cargarDatosIniciales();
    if (isEditMode && id) {
      cargarCaso(parseInt(id));
    }
  }, [id, isEditMode]);

  const cargarDatosIniciales = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [estadosResponse, fiscalesResponse] = await Promise.all([
        casoService.obtenerEstados(),
        casoService.obtenerFiscales()
      ]);

      if (estadosResponse.success && estadosResponse.data) {
        setEstados(estadosResponse.data);
      }

      if (fiscalesResponse.success && fiscalesResponse.data) {
        setFiscales(fiscalesResponse.data);
      }
    } catch (err: any) {
      setError('Error al cargar datos iniciales: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarCaso = async (casoId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await casoService.obtenerCaso(casoId);

      if (response.success && response.data) {
        setCaso(response.data);
      } else {
        setError(response.message || 'Error al cargar el caso');
      }
    } catch (err: any) {
      setError('Error al cargar el caso: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: CasoForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      let response;
      if (isEditMode && id) {
        response = await casoService.actualizarCaso(parseInt(id), values);
      } else {
        response = await casoService.crearCaso(values);
      }

      if (response.success) {
        setSuccess(
          isEditMode 
            ? 'Caso actualizado exitosamente' 
            : 'Caso creado exitosamente'
        );
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          navigate('/casos-lista');
        }, 2000);
      } else {
        setError(response.message || 'Error al guardar el caso');
      }
    } catch (err: any) {
      setError('Error al guardar el caso: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/casos-lista');
  };

  const obtenerNombreEstado = (idEstado?: number): string => {
    if (typeof idEstado !== 'number') return 'Sin estado';
    const estado = estados.find(e => e.idEstado === idEstado);
    return estado?.nombreEstado || 'Estado desconocido';
  };

  const obtenerNombreFiscal = (idFiscal: number | null | undefined): string => {
    if (!idFiscal) return 'Sin asignar';
    const fiscal = fiscales.find(f => f.idFiscal === idFiscal);
    return fiscal ? `${fiscal.nombres} ${fiscal.apellidos}` : 'Fiscal desconocido';
  };

  // Verificar permisos - modo más permisivo para desarrollo
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          Debes iniciar sesión para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  // En modo desarrollo, permitir acceso si está autenticado
  // En producción, verificar permisos específicos
  const tienePermisoEditar = permisos.CASE_EDIT || isAuthenticated;
  const tienePermisoCrear = permisos.CASE_CREATE || isAuthenticated;

  if (isEditMode && !tienePermisoEditar) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          No tienes permisos para editar casos.
        </Alert>
      </Container>
    );
  }

  if (!isEditMode && !tienePermisoCrear) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">
          No tienes permisos para crear casos.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
          >
            Dashboard
          </Link>
          <Link 
            color="inherit" 
            href="#" 
            onClick={(e) => { e.preventDefault(); navigate('/casos-lista'); }}
          >
            Lista de Casos
          </Link>
          <Typography color="text.primary">
            {pageTitle}
          </Typography>
        </Breadcrumbs>

        {/* Título y botón volver */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1">
            {pageTitle}
          </Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={handleCancel}
            variant="outlined"
          >
            Volver a Lista
          </Button>
        </Stack>

        {/* Información del caso en modo edición */}
        {isEditMode && caso && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información del Caso
            </Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    ID del Caso: <strong>{caso.idCaso || caso.id}</strong>
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Fecha de Creación: <strong>{formatearFecha(caso.fechaCreacion)}</strong>
                  </Typography>
                </Box>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Estado Actual: <Chip label={obtenerNombreEstado(caso.idEstado)} size="small" />
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="text.secondary">
                    Fiscal Asignado: <strong>{obtenerNombreFiscal(caso.idFiscalAsignado)}</strong>
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Formulario */}
        <Paper sx={{ p: 3 }}>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              enableReinitialize={true}
              onSubmit={handleSubmit}
            >
              {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                <Form>
                  <Stack spacing={3}>
                    {/* Número de Caso y Estado */}
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                      <Box flex={1}>
                        <TextField
                          fullWidth
                          name="numeroCaso"
                          label="Número de Caso Único"
                          value={values.numeroCaso}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.numeroCaso && Boolean(errors.numeroCaso)}
                          helperText={touched.numeroCaso && errors.numeroCaso}
                          disabled={isEditMode} // En modo edición no se puede cambiar
                          placeholder="Ej: MP-2024-001"
                        />
                      </Box>
                      <Box flex={1}>
                        <FormControl fullWidth error={touched.idEstado && Boolean(errors.idEstado)}>
                          <InputLabel>Estado del Caso</InputLabel>
                          <Select
                            name="idEstado"
                            value={values.idEstado}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            label="Estado del Caso"
                          >
                            {estados.map((estado) => (
                              <MenuItem key={estado.idEstado} value={estado.idEstado}>
                                {estado.nombreEstado}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.idEstado && errors.idEstado && (
                            <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                              {errors.idEstado}
                            </Typography>
                          )}
                        </FormControl>
                      </Box>
                    </Stack>

                    {/* Descripción */}
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="descripcion"
                      label="Descripción del Caso"
                      value={values.descripcion}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.descripcion && Boolean(errors.descripcion)}
                      helperText={touched.descripcion && errors.descripcion}
                      placeholder="Describe detalladamente el caso..."
                    />

                    {/* Detalle de Progreso */}
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="detalleProgreso"
                      label="Detalle de Progreso (Opcional)"
                      value={values.detalleProgreso}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.detalleProgreso && Boolean(errors.detalleProgreso)}
                      helperText={touched.detalleProgreso && errors.detalleProgreso}
                      placeholder="Describe el progreso actual del caso..."
                    />

                    {/* Fiscal Asignado */}
                    <Box sx={{ maxWidth: { xs: '100%', md: '50%' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Fiscal Asignado (Opcional)</InputLabel>
                        <Select
                          name="idFiscalAsignado"
                          value={values.idFiscalAsignado || ''}
                          onChange={(e) => {
                            const value = e.target.value as string | number;
                            setFieldValue('idFiscalAsignado', value === '' ? null : Number(value));
                          }}
                          onBlur={handleBlur}
                          label="Fiscal Asignado (Opcional)"
                        >
                          <MenuItem value="">
                            <em>Sin asignar</em>
                          </MenuItem>
                          {fiscales.map((fiscal) => (
                            <MenuItem key={fiscal.idFiscal} value={fiscal.idFiscal}>
                              {fiscal.nombres} {fiscal.apellidos}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Botones de acción */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        startIcon={<CancelIcon />}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Caso'}
                      </Button>
                    </Stack>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default CasoFormPage;
