import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  InputAdornment,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assignment as AssignIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  Caso, 
  EstadoCaso, 
  Fiscal, 
  FiltrosCasos,
  PaginatedResponse
} from '../types';
import { casoService } from '../services/casoService';
import { usePermisos } from '../hooks/usePermisos';
import { formatearFecha } from '../utils/fechas';
import { useNavigate } from 'react-router-dom';

const CasosListPage: React.FC = () => {
  const navigate = useNavigate();
  const { permisos } = usePermisos();

  // Estados principales
  const [casos, setCasos] = useState<Caso[]>([]);
  const [estados, setEstados] = useState<EstadoCaso[]>([]);
  const [fiscales, setFiscales] = useState<Fiscal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filtros, setFiltros] = useState<FiltrosCasos>({
    busqueda: '',
    idEstado: undefined,
    idFiscal: undefined,
    page: 1,
    limit: 10
  });

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [resultadosPorPagina, setResultadosPorPagina] = useState(10);
  const [totalResultados, setTotalResultados] = useState(0);
  // const [totalPaginas, setTotalPaginas] = useState(0); // Eliminado porque no se usa

  // Estados para modal de reasignación
  const [reasignacionDialog, setReasignacionDialog] = useState(false);
  const [casoSeleccionado, setCasoSeleccionado] = useState<Caso | null>(null);
  const [fiscalSeleccionado, setFiscalSeleccionado] = useState<number | ''>('');

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Cargar casos cuando cambian los filtros o paginación
  useEffect(() => {
    cargarCasos();
  }, [paginaActual, resultadosPorPagina, filtros]);

  const cargarDatosIniciales = async () => {
    try {
      setIsLoading(true);
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

  const cargarCasos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const filtrosActuales: FiltrosCasos = {
        ...filtros,
        page: paginaActual,
        limit: resultadosPorPagina
      };

      const response = await casoService.listarCasos(filtrosActuales);

      if (response.success && response.data) {
        const data = response.data as PaginatedResponse<Caso>;
        setCasos(data.data || []);
        setTotalResultados(data.total || 0);
        // setTotalPaginas(data.totalPages || 0); // Eliminado porque no se usa
      } else {
        setError(response.message || 'Error al cargar casos');
      }
    } catch (err: any) {
      setError('Error al cargar casos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejadores de eventos
  const handleBusquedaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valor = event.target.value;
    setFiltros(prev => ({ ...prev, busqueda: valor }));
    setPaginaActual(1); // Resetear a primera página
  };

  const handleEstadoChange = (event: any) => {
    const valor = event.target.value === '' ? undefined : Number(event.target.value);
    setFiltros(prev => ({ ...prev, idEstado: valor }));
    setPaginaActual(1);
  };

  const handleFiscalChange = (event: any) => {
    const valor = event.target.value === '' ? undefined : Number(event.target.value);
    setFiltros(prev => ({ ...prev, idFiscal: valor }));
    setPaginaActual(1);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginaActual(newPage + 1); // MUI usa índice 0, API usa índice 1
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setResultadosPorPagina(newLimit);
    setPaginaActual(1);
  };

  const handleNuevoCaso = () => {
    navigate('/casos/nuevo');
  };

  const handleVerDetalle = (caso: Caso) => {
    navigate(`/casos/${caso.idCaso || caso.id}`);
  };

  const handleEditarCaso = (caso: Caso) => {
    navigate(`/casos/editar/${caso.idCaso || caso.id}`);
  };

  const handleReasignar = (caso: Caso) => {
    setCasoSeleccionado(caso);
    setFiscalSeleccionado('');
    setReasignacionDialog(true);
  };

  const handleConfirmarReasignacion = async () => {
    if (!casoSeleccionado || !fiscalSeleccionado) return;

    try {
      setIsLoading(true);
      const response = await casoService.reasignarFiscal(
        casoSeleccionado.idCaso || casoSeleccionado.id,
        fiscalSeleccionado as number
      );

      if (response.success) {
        setReasignacionDialog(false);
        setCasoSeleccionado(null);
        setFiscalSeleccionado('');
        cargarCasos(); // Recargar la lista
      } else {
        setError(response.message || 'Error al reasignar fiscal');
      }
    } catch (err: any) {
      setError('Error al reasignar fiscal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      idEstado: undefined,
      idFiscal: undefined,
      page: 1,
      limit: resultadosPorPagina
    });
    setPaginaActual(1);
  };

  const obtenerNombreEstado = (idEstado?: number) => {
    if (typeof idEstado !== 'number') return 'Sin estado';
    const estado = estados.find(e => e.idEstado === idEstado);
    return estado?.nombreEstado || 'Sin estado';
  };

  const obtenerColorEstado = (idEstado?: number) => {
    if (typeof idEstado !== 'number') return 'default';
    // Colores basados en estados típicos
    const colores: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'Abierto': 'info',
      'En Investigación': 'primary',
      'En Proceso': 'warning',
      'Cerrado': 'success',
      'Archivado': 'default',
      'Pendiente': 'secondary'
    };
    const nombreEstado = obtenerNombreEstado(idEstado);
    return colores[nombreEstado] || 'default';
  };

  const obtenerNombreFiscal = (caso: Caso) => {
    if (caso.idFiscalAsignado) {
      const fiscal = fiscales.find(f => f.idFiscal === caso.idFiscalAsignado);
      if (fiscal) return `${fiscal.primerNombre} ${fiscal.primerApellido}`;
    }
    if (caso.fiscalPrimerNombre || caso.fiscalPrimerApellido) {
      return `${caso.fiscalPrimerNombre || ''} ${caso.fiscalPrimerApellido || ''}`.trim();
    }
    return 'Sin asignar';
  };

  if (isLoading && casos.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* Encabezado */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button variant="outlined" onClick={() => window.history.length > 1 ? window.history.back() : navigate('/dashboard')}>
              Volver
            </Button>
            <Typography variant="h4" component="h1">
              Gestión de Casos
            </Typography>
          </Stack>
          {permisos.CASE_CREATE && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNuevoCaso}
            >
              Nuevo Caso
            </Button>
          )}
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
              <TextField
                sx={{ minWidth: { xs: '100%', md: '300px' } }}
                label="Buscar"
                placeholder="Número de caso o descripción..."
                value={filtros.busqueda || ''}
                onChange={handleBusquedaChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: { xs: '100%', md: '200px' } }}>
                <InputLabel>Estado del Caso</InputLabel>
                <Select
                  value={filtros.idEstado || ''}
                  onChange={handleEstadoChange}
                  label="Estado del Caso"
                >
                  <MenuItem value="">Todos los estados</MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado.idEstado} value={estado.idEstado}>
                      {estado.nombreEstado}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: { xs: '100%', md: '200px' } }}>
                <InputLabel>Fiscal Asignado</InputLabel>
                <Select
                  value={filtros.idFiscal || ''}
                  onChange={handleFiscalChange}
                  label="Fiscal Asignado"
                >
                  <MenuItem value="">Todos los fiscales</MenuItem>
                  {fiscales.map((fiscal) => (
                    <MenuItem key={fiscal.idFiscal} value={fiscal.idFiscal}>
                      {fiscal.primerNombre} {fiscal.primerApellido}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1}>
                <Button onClick={limpiarFiltros}>
                  Limpiar
                </Button>
                <Tooltip title="Actualizar">
                  <IconButton onClick={cargarCasos}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Mensajes de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabla de casos */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Número Único</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fiscal Asignado</TableCell>
                  <TableCell>Fecha Creación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : casos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No se encontraron casos
                    </TableCell>
                  </TableRow>
                ) : (
                  casos.map((caso) => (
                    <TableRow key={caso.idCaso || caso.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {caso.numeroCaso || caso.numeroExpediente || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>
                          {caso.titulo || caso.descripcion || 'Sin descripción'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={caso.nombreEstado || obtenerNombreEstado(caso.idEstado)}
                          color={obtenerColorEstado(caso.idEstado)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {obtenerNombreFiscal(caso)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatearFecha(caso.fechaCreacion)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Ver detalle">
                            <IconButton
                              size="small"
                              onClick={() => handleVerDetalle(caso)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {permisos.CASE_EDIT && (
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => handleEditarCaso(caso)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {permisos.CASE_REASSIGN && (
                            <Tooltip title="Reasignar fiscal">
                              <IconButton
                                size="small"
                                onClick={() => handleReasignar(caso)}
                              >
                                <AssignIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación */}
          <TablePagination
            component="div"
            count={totalResultados}
            page={paginaActual - 1} // MUI usa índice 0
            onPageChange={handleChangePage}
            rowsPerPage={resultadosPorPagina}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Casos por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
            }
          />
        </Paper>

        {/* Dialog de Reasignación */}
        <Dialog open={reasignacionDialog} onClose={() => setReasignacionDialog(false)}>
          <DialogTitle>
            Reasignar Fiscal
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Caso: {casoSeleccionado?.numeroCaso || casoSeleccionado?.numeroExpediente}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {casoSeleccionado?.titulo || casoSeleccionado?.descripcion}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Nuevo Fiscal</InputLabel>
              <Select
                value={fiscalSeleccionado}
                onChange={(e) => setFiscalSeleccionado(e.target.value)}
                label="Nuevo Fiscal"
              >
                {fiscales.map((fiscal) => (
                  <MenuItem key={fiscal.idFiscal} value={fiscal.idFiscal}>
                    {fiscal.primerNombre} {fiscal.primerApellido}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReasignacionDialog(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmarReasignacion}
              disabled={!fiscalSeleccionado}
            >
              Reasignar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default CasosListPage;
