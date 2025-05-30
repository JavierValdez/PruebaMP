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
  type ResultadoInformePeriodo = {
    resumen?: any[];
    casosPorEstado?: any[];
    casosPorFiscal?: any[];
  };
  const [resultadoInforme, setResultadoInforme] = useState<any[] | ResultadoInformePeriodo | null>(null);
  const [tipoUltimoInforme, setTipoUltimoInforme] = useState<TipoInforme | null>(null);

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

  // useEffect y loadInformes eliminados porque no existe endpoint para listar informes

  const handleGenerarInforme = async () => {
    try {
      setGenerandoInforme(true);
      setError(null);
      setResultadoInforme(null);
      setTipoUltimoInforme(null);

      let response;
      if (filtros.tipoInforme === 'casos-por-estado') {
        response = await informeService.obtenerInformeCasosPorEstado();
        if (response.success && response.data) {
          // Soportar respuesta con { casos: [...] }
          const data = Array.isArray(response.data)
            ? response.data
            : (typeof response.data === 'object' && response.data !== null && 'casos' in response.data && Array.isArray((response.data as any).casos)
                ? (response.data as any).casos
                : [response.data]);
          setResultadoInforme(data);
          setTipoUltimoInforme('casos-por-estado');
        }
      } else if (filtros.tipoInforme === 'casos-por-fiscal') {
        response = await informeService.obtenerInformeCasosPorFiscal({
          fiscalia: filtros.idFiscal,
        });
        if (response.success && response.data) {
          // Soportar respuesta con { fiscales: [...] }
          const data = Array.isArray(response.data)
            ? response.data
            : (typeof response.data === 'object' && response.data !== null && 'fiscales' in response.data && Array.isArray((response.data as any).fiscales)
                ? (response.data as any).fiscales
                : [response.data]);
          setResultadoInforme(data);
          setTipoUltimoInforme('casos-por-fiscal');
        }
      } else if (filtros.tipoInforme === 'casos-por-periodo' || filtros.tipoInforme === 'resumen-mensual') {
        response = await informeService.obtenerEstadisticas();
        if (response.success && response.data) {
          // Soportar respuesta con resumen, casosPorEstado y casosPorFiscal
          const resumen = response.data.resumen ? [response.data.resumen] : [];
          const casosPorEstado = Array.isArray(response.data.casosPorEstado) ? response.data.casosPorEstado : [];
          const casosPorFiscal = Array.isArray(response.data.casosPorFiscal) ? response.data.casosPorFiscal : [];
          setResultadoInforme({ resumen, casosPorEstado, casosPorFiscal });
          setTipoUltimoInforme(filtros.tipoInforme);
        }
      } else {
        setError('Tipo de informe no soportado');
        return;
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

  const handleVolver = () => {
    window.history.length > 1 ? window.history.back() : window.location.assign('/dashboard');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button variant="outlined" onClick={handleVolver}>
          Volver
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Informes y Reportes
        </Typography>
      </Stack>

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


      {/* Resultado del informe generado dinámicamente */}


      {/* Renderizado para informes por estado y fiscal (array plano) */}
      {resultadoInforme && tipoUltimoInforme === 'casos-por-estado' && Array.isArray(resultadoInforme) && resultadoInforme.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultado del Informe
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Estado</TableCell>
                    <TableCell>Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultadoInforme.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.NombreEstado || row.estado}</TableCell>
                      <TableCell>{row.TotalCasos ?? row.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {resultadoInforme && tipoUltimoInforme === 'casos-por-fiscal' && Array.isArray(resultadoInforme) && resultadoInforme.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Resultado del Informe
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fiscal</TableCell>
                    <TableCell>Fiscalía</TableCell>
                    <TableCell>Asignados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resultadoInforme.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.NombreFiscalCompleto || row.fiscal}</TableCell>
                      <TableCell>{row.NombreFiscalia || row.fiscalia}</TableCell>
                      <TableCell>{row.TotalCasosAsignados ?? row.casosAsignados}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Renderizado especial para informes por periodo/resumen-mensual */}
      {resultadoInforme && tipoUltimoInforme && typeof resultadoInforme === 'object' && !Array.isArray(resultadoInforme) && (
        <>
          {/* Resumen */}
          {resultadoInforme.resumen && Array.isArray(resultadoInforme.resumen) && resultadoInforme.resumen.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen del Periodo
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Total Casos</TableCell>
                        <TableCell>Fiscales Activos</TableCell>
                        <TableCell>Promedio Casos por Fiscal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{resultadoInforme.resumen[0].totalCasos}</TableCell>
                        <TableCell>{resultadoInforme.resumen[0].fiscalesActivos}</TableCell>
                        <TableCell>{resultadoInforme.resumen[0].promedioCasosPorFiscal}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
          {/* Casos por Estado */}
          {resultadoInforme.casosPorEstado && Array.isArray(resultadoInforme.casosPorEstado) && resultadoInforme.casosPorEstado.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Casos por Estado
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Estado</TableCell>
                        <TableCell>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultadoInforme.casosPorEstado.map((row: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{row.NombreEstado || row.estado}</TableCell>
                          <TableCell>{row.TotalCasos ?? row.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
          {/* Casos por Fiscal */}
          {resultadoInforme.casosPorFiscal && Array.isArray(resultadoInforme.casosPorFiscal) && resultadoInforme.casosPorFiscal.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Casos por Fiscal
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fiscal</TableCell>
                        <TableCell>Fiscalía</TableCell>
                        <TableCell>Asignados</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resultadoInforme.casosPorFiscal.map((row: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell>{row.NombreFiscalCompleto || row.fiscal}</TableCell>
                          <TableCell>{row.NombreFiscalia || row.fiscalia}</TableCell>
                          <TableCell>{row.TotalCasosAsignados ?? row.casosAsignados}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Lista de informes generados eliminada porque no existe endpoint para listar informes */}
    </Box>
  );
};

export default InformesPage;
