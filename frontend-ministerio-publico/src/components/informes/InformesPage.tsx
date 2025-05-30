import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  GetApp,
  Print,
  Assessment,
  DateRange,
  PieChart,
  BarChart,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { informeService } from '../../services/informeService';
import { Informe } from '../../types';

type TipoInforme = 'casos-por-estado' | 'casos-por-fiscal' | 'casos-por-periodo' | 'resumen-mensual';

interface FiltrosInforme {
  tipoInforme: TipoInforme;
  fechaInicio?: Dayjs | null;
  fechaFin?: Dayjs | null;
  idFiscal?: number;
  estado?: string;
}

const InformesPage: React.FC = () => {
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    tipoInforme: 'casos-por-estado'
  });
  const [informes, setInformes] = useState<Informe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generandoInforme, setGenerandoInforme] = useState(false);

  const tiposInforme = [
    { value: 'casos-por-estado', label: 'Casos por Estado' },
    { value: 'casos-por-fiscal', label: 'Casos por Fiscal' },
    { value: 'casos-por-periodo', label: 'Casos por Período' },
    { value: 'resumen-mensual', label: 'Resumen Mensual' },
  ];

  const estados = [
    'ABIERTO',
    'EN_INVESTIGACION',
    'EN_JUICIO',
    'CERRADO',
    'ARCHIVADO',
    'SUSPENDIDO'
  ];

  useEffect(() => {
    loadInformes();
  }, []);

  const loadInformes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await informeService.listarInformes();
      if (response.success && response.data) {
        setInformes(response.data);
      }
    } catch (err) {
      setError('Error al cargar los informes');
      console.error('Error loading informes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarInforme = async () => {
    try {
      setGenerandoInforme(true);
      setError(null);
      
      const parametros = {
        fechaInicio: filtros.fechaInicio?.format('YYYY-MM-DD'),
        fechaFin: filtros.fechaFin?.format('YYYY-MM-DD'),
        idFiscal: filtros.idFiscal,
        estado: filtros.estado,
      };

      const response = await informeService.generarInforme({
        tipoInforme: filtros.tipoInforme,
        parametros
      });

      if (response.success) {
        await loadInformes(); // Recargar la lista de informes
        setFiltros({ tipoInforme: 'casos-por-estado' }); // Reset form
        alert('Informe generado exitosamente');
      }
    } catch (err) {
      setError('Error al generar el informe');
      console.error('Error generating informe:', err);
    } finally {
      setGenerandoInforme(false);
    }
  };

  const handleDescargarInforme = async (idInforme: number) => {
    try {
      const response = await informeService.descargarInforme(idInforme);
      if (response.success && response.data) {
        // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `informe_${idInforme}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Error al descargar el informe');
      console.error('Error downloading informe:', err);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'GENERADO':
        return 'success';
      case 'PROCESANDO':
        return 'warning';
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  const getIconoTipoInforme = (tipo: string) => {
    switch (tipo) {
      case 'casos-por-estado':
        return <PieChart />;
      case 'casos-por-fiscal':
        return <BarChart />;
      case 'casos-por-periodo':
        return <DateRange />;
      default:
        return <Assessment />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Informes y Reportes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Formulario para generar nuevos informes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generar Nuevo Informe
          </Typography>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Informe</InputLabel>
                <Select
                  value={filtros.tipoInforme}
                  label="Tipo de Informe"
                  onChange={(e) => setFiltros(prev => ({ 
                    ...prev, 
                    tipoInforme: e.target.value as TipoInforme 
                  }))}
                >
                  {tiposInforme.map(tipo => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getIconoTipoInforme(tipo.value)}
                        {tipo.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <DatePicker
                  label="Fecha Inicio"
                  value={filtros.fechaInicio}
                  onChange={(date: Dayjs | null) => setFiltros(prev => ({ ...prev, fechaInicio: date }))}
                />
                
                <DatePicker
                  label="Fecha Fin"
                  value={filtros.fechaFin}
                  onChange={(date: Dayjs | null) => setFiltros(prev => ({ ...prev, fechaFin: date }))}
                />
              </Stack>

              {filtros.tipoInforme === 'casos-por-estado' && (
                <FormControl fullWidth>
                  <InputLabel>Estado (Opcional)</InputLabel>
                  <Select
                    value={filtros.estado || ''}
                    label="Estado (Opcional)"
                    onChange={(e) => setFiltros(prev => ({ 
                      ...prev, 
                      estado: e.target.value || undefined 
                    }))}
                  >
                    <MenuItem value="">Todos los estados</MenuItem>
                    {estados.map(estado => (
                      <MenuItem key={estado} value={estado}>
                        {estado.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="contained"
                startIcon={generandoInforme ? <CircularProgress size={20} /> : <Assessment />}
                onClick={handleGenerarInforme}
                disabled={generandoInforme}
                size="large"
              >
                {generandoInforme ? 'Generando...' : 'Generar Informe'}
              </Button>
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      <Divider sx={{ my: 3 }} />

      {/* Lista de informes generados */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Informes Generados
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Fecha Generación</TableCell>
                    <TableCell>Período</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {informes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No hay informes generados
                      </TableCell>
                    </TableRow>
                  ) : (
                    informes.map((informe) => (
                      <TableRow key={informe.idInforme}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getIconoTipoInforme(informe.tipoInforme)}
                            {informe.tipoInforme.replace('-', ' ').toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {dayjs(informe.fechaGeneracion).format('DD/MM/YYYY HH:mm')}
                        </TableCell>
                        <TableCell>
                          {informe.fechaInicio && informe.fechaFin 
                            ? `${dayjs(informe.fechaInicio).format('DD/MM/YYYY')} - ${dayjs(informe.fechaFin).format('DD/MM/YYYY')}`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={informe.estado}
                            color={getEstadoColor(informe.estado)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              startIcon={<GetApp />}
                              onClick={() => handleDescargarInforme(informe.idInforme)}
                              disabled={informe.estado !== 'GENERADO'}
                            >
                              Descargar
                            </Button>
                            <Button
                              size="small"
                              startIcon={<Print />}
                              disabled={informe.estado !== 'GENERADO'}
                            >
                              Imprimir
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default InformesPage;
