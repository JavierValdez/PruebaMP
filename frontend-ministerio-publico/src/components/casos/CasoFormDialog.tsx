import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Stack
} from '@mui/material';
import { Caso, CasoForm, EstadoCaso, Fiscal } from '../../types';
import { casoService } from '../../services/casoService';

interface CasoFormDialogProps {
  open: boolean;
  caso?: Caso;
  onClose: () => void;
  onSave: (caso: Caso) => void;
}

const CasoFormDialog: React.FC<CasoFormDialogProps> = ({
  open,
  caso,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estados, setEstados] = useState<EstadoCaso[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form fields
  const [numeroCaso, setNumeroCaso] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idEstado, setIdEstado] = useState<number | undefined>(0);
  const [idFiscalAsignado, setIdFiscalAsignado] = useState<number | undefined>(undefined);

  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!numeroCaso.trim()) {
      newErrors.numeroCaso = 'El número de caso es obligatorio';
    }
    
    if (!titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    }
    
    if (!idEstado || idEstado === 0) {
      newErrors.idEstado = 'El estado es obligatorio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load form data (estados y fiscales)
  const loadFormData = async () => {
    try {
      setLoadingData(true);
      
      // Load estados
      try {
        const estadosResponse = await casoService.obtenerEstados();
        if (estadosResponse.success && estadosResponse.data) {
          setEstados(estadosResponse.data);
        }
      } catch (err) {
        console.error('Error loading estados:', err);
      }

      // Load fiscales
      try {
        const fiscalesResponse = await casoService.obtenerFiscales();
        if (fiscalesResponse.success && fiscalesResponse.data) {
          setFiscales(fiscalesResponse.data);
        }
      } catch (err) {
        console.error('Error loading fiscales:', err);
      }
    } catch (err: any) {
      console.error('Error loading form data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadFormData();
      
      // Reset form with caso data if editing
      if (caso) {
        setNumeroCaso(caso.numeroCaso);
        setTitulo(caso.titulo);
        setDescripcion(caso.descripcion || '');
        setIdEstado(caso.idEstado ?? 0);
        setIdFiscalAsignado(caso.idFiscalAsignado);
      } else {
        setNumeroCaso('');
        setTitulo('');
        setDescripcion('');
        setIdEstado(0);
        setIdFiscalAsignado(undefined);
      }
      setError(null);
      setErrors({});
    }
  }, [open, caso]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert form data to CasoForm
      const casoData: CasoForm = {
        numeroCaso,
        titulo,
        descripcion,
        idEstado: idEstado ?? 0,
        idFiscalAsignado
      };

      let response;
      if (caso) {
        // Edit existing caso
        response = await casoService.actualizarCaso(caso.idCaso, casoData);
      } else {
        // Create new caso
        response = await casoService.crearCaso(casoData);
      }

      if (response.success && response.data) {
        onSave(response.data);
        onClose();
      } else {
        setError(response.message || 'Error al guardar el caso');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al guardar el caso');
      console.error('Error saving caso:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {caso ? 'Editar Caso' : 'Nuevo Caso'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {loadingData ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {error && (
                <Alert severity="error">
                  {error}
                </Alert>
              )}

              <TextField
                label="Número de Caso *"
                fullWidth
                value={numeroCaso}
                onChange={(e) => setNumeroCaso(e.target.value)}
                error={!!errors.numeroCaso}
                helperText={errors.numeroCaso}
                disabled={loading}
              />

              <TextField
                label="Título *"
                fullWidth
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                error={!!errors.titulo}
                helperText={errors.titulo}
                disabled={loading}
              />

              <TextField
                label="Descripción"
                multiline
                rows={4}
                fullWidth
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={loading}
              />

              <FormControl fullWidth error={!!errors.idEstado}>
                <InputLabel>Estado *</InputLabel>
                <Select
                  value={idEstado}
                  onChange={(e) => setIdEstado(Number(e.target.value))}
                  label="Estado *"
                  disabled={loading}
                >
                  <MenuItem value={0}>Seleccionar estado</MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado.idEstado} value={estado.idEstado}>
                      {estado.nombreEstado}
                    </MenuItem>
                  ))}
                </Select>
                {errors.idEstado && (
                  <Box color="error.main" fontSize="0.75rem" mt={0.5}>
                    {errors.idEstado}
                  </Box>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Fiscal Asignado</InputLabel>
                <Select
                  value={idFiscalAsignado || ''}
                  onChange={(e) => setIdFiscalAsignado(e.target.value ? Number(e.target.value) : undefined)}
                  label="Fiscal Asignado"
                  disabled={loading}
                >
                  <MenuItem value="">Sin asignar</MenuItem>
                  {fiscales.map((fiscal) => (
                    <MenuItem key={fiscal.idFiscal} value={fiscal.idFiscal}>
                      {fiscal.nombres || `${fiscal.primerNombre} ${fiscal.primerApellido}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingData}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Guardando...' : (caso ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CasoFormDialog;
