import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Caso, EstadoCasoType } from '../../types';
import { casoService } from '../../services/casoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CasosListProps {
  onCreateCaso?: () => void;
  onEditCaso?: (caso: Caso) => void;
  onViewCaso?: (caso: Caso) => void;
}

const CasosList: React.FC<CasosListProps> = ({
  onCreateCaso,
  onEditCaso,
  onViewCaso
}) => {
  const [casos, setCasos] = useState<Caso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoCasoType | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCasos, setTotalCasos] = useState(0);

  const loadCasos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        page,
        limit: 10
      };

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (estadoFilter) {
        filters.estado = estadoFilter;
      }

      const response = await casoService.getCasos(filters);
      
      if (response.success && response.data) {
        setCasos(response.data.casos || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCasos(response.data.total || 0);
      } else {
        setError(response.message || 'Error al cargar los casos');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado al cargar los casos');
      console.error('Error loading casos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCasos();
  }, [page, searchTerm, estadoFilter]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleEstadoFilterChange = (event: any) => {
    setEstadoFilter(event.target.value);
    setPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const getEstadoColor = (estado: EstadoCasoType): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'CERRADO':
        return 'default';
      case 'EN_INVESTIGACION':
        return 'info';
      case 'EN_PROCESO':
        return 'warning';
      case 'ARCHIVADO':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatEstado = (estado: EstadoCasoType): string => {
    return estado.replace(/_/g, ' ');
  };

  if (loading && casos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Gestión de Casos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateCaso}
        >
          Nuevo Caso
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} alignItems="center">
            <TextField
              fullWidth
              placeholder="Buscar casos..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFilter}
                onChange={handleEstadoFilterChange}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="EN_INVESTIGACION">En Investigación</MenuItem>
                <MenuItem value="EN_PROCESO">En Proceso</MenuItem>
                <MenuItem value="CERRADO">Cerrado</MenuItem>
                <MenuItem value="ARCHIVADO">Archivado</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Total: {totalCasos} casos
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Cases List */}
      {casos.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" textAlign="center" py={4}>
              No se encontraron casos con los filtros aplicados.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {casos.map((caso) => (
            <Card key={caso.id || caso.idCaso}>
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        Caso #{caso.numeroExpediente || caso.numeroCaso}
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {caso.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {caso.descripcion}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" mt={1} flexWrap="wrap">
                        {caso.estado && (
                          <Chip
                            label={formatEstado(caso.estado)}
                            color={getEstadoColor(caso.estado)}
                            size="small"
                          />
                        )}
                        {(caso.fiscal || caso.fiscalAsignado) && (
                          <Chip
                            label={`Fiscal: ${(caso.fiscal?.nombres || caso.fiscalAsignado?.primerNombre + ' ' + caso.fiscalAsignado?.primerApellido) || 'No asignado'}`}
                            variant="outlined"
                            size="small"
                          />
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Creado: {format(new Date(caso.fechaCreacion), 'dd/MM/yyyy', { locale: es })}
                        </Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        color="primary"
                        onClick={() => onViewCaso?.(caso)}
                        title="Ver caso"
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => onEditCaso?.(caso)}
                        title="Editar caso"
                      >
                        <EditIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {loading && casos.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <CircularProgress size={24} />
        </Box>
      )}
    </Box>
  );
};

export default CasosList;
