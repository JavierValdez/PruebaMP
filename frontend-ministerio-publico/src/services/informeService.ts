import { ApiResponse, Informe, DashboardDataBackend } from '../types';
import apiClient from './apiClient';

// Interfaces para los informes
export interface DashboardData {
  totalCasos: number;
  casosAbiertos: number;
  casosCerrados: number;
  casosAsignados: number;
  casosSinAsignar: number;
  fiscalesActivos: number;
  fiscaliasActivas: number;
  casosHoy: number;
  casosSemana: number;
  casosMes: number;
  casosPorEstado: { [estado: string]: number };
  casosPorFiscalia: { [fiscalia: string]: number };
  tendenciaSemanal: number[];
}

export interface InformeCasosPorEstado {
  estado: string;
  total: number;
  porcentaje: number;
}

export interface InformeCasosPorFiscal {
  fiscal: string;
  fiscalia: string;
  casosAsignados: number;
  casosCerrados: number;
  casosAbiertos: number;
  eficiencia: number;
}

export interface InformeProductividadFiscalia {
  fiscalia: string;
  totalCasos: number;
  casosCerrados: number;
  casosAbiertos: number;
  tiempoPromedioResolucion: number;
  fiscalesActivos: number;
}

export interface InformeReasignacionesFallidas {
  fecha: string;
  idCaso: number;
  numeroCaso: string;
  fiscalOriginal: string;
  fiscalDestino: string;
  razonFallo: string;
}

export interface FiltrosFechas {
  fechaInicio?: string;
  fechaFin?: string;
  fiscalia?: number;
}

export interface GenerarInformeParams {
  tipoInforme: string;
  parametros?: {
    fechaInicio?: string;
    fechaFin?: string;
    idFiscal?: number;
    estado?: string;
  }
}

export class InformeService {
  // Obtener dashboard principal
  async obtenerDashboard(): Promise<ApiResponse<DashboardDataBackend>> {
    try {
      const response = await apiClient.get<DashboardDataBackend>('/informes/dashboard');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener dashboard');
    }
  }

  // Obtener estadísticas generales
  async obtenerEstadisticas(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>('/informes/estadisticas');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }

  // Obtener informe de casos por estado
  async obtenerInformeCasosPorEstado(): Promise<ApiResponse<InformeCasosPorEstado[]>> {
    try {
      const response = await apiClient.get<InformeCasosPorEstado[]>('/informes/casos-por-estado');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener informe de casos por estado');
    }
  }

  // Obtener informe de casos por fiscal
  async obtenerInformeCasosPorFiscal(filtros: FiltrosFechas = {}): Promise<ApiResponse<InformeCasosPorFiscal[]>> {
    try {
      const params = {
        fiscalia: filtros.fiscalia
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.get<InformeCasosPorFiscal[]>('/informes/casos-por-fiscal', filteredParams);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener informe de casos por fiscal');
    }
  }

  // Obtener informe de productividad por fiscalía
  async obtenerInformeProductividadPorFiscalia(): Promise<ApiResponse<InformeProductividadFiscalia[]>> {
    try {
      const response = await apiClient.get<InformeProductividadFiscalia[]>('/informes/productividad-fiscalias');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener informe de productividad');
    }
  }

  // Obtener informe de reasignaciones fallidas
  async obtenerInformeReasignacionesFallidas(filtros: FiltrosFechas = {}): Promise<ApiResponse<InformeReasignacionesFallidas[]>> {
    try {
      const params = {
        fechaInicio: filtros.fechaInicio,
        fechaFin: filtros.fechaFin
      };

      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.get<InformeReasignacionesFallidas[]>('/informes/reasignaciones-fallidas', filteredParams);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener informe de reasignaciones fallidas');
    }
  }

  // Exportar informe
  async exportarInforme(tipo: string, formato: string = 'json'): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>(`/informes/exportar/${tipo}`, { formato });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al exportar informe');
    }
  }

  // Métodos de utilidad para generar URLs de descarga
  getExportUrl(tipo: string, formato: string = 'json'): string {
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
    const token = localStorage.getItem('token');
    return `${baseUrl}/informes/exportar/${tipo}?formato=${formato}&token=${token}`;
  }

  // Listar todos los informes generados (NO EXISTE EN BACKEND, deshabilitado)
  // async listarInformes(): Promise<ApiResponse<Informe[]>> {
  //   try {
  //     const response = await apiClient.get<Informe[]>('/informes');
  //     return response;
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Error al obtener la lista de informes');
  //   }
  // }
  
  // Generar un nuevo informe (AJUSTADO: usar rutas GET existentes)
  // Puedes crear métodos específicos según el tipo de informe que necesitas generar
  // Por ejemplo:
  // async generarInformeCasosPorEstado(): Promise<ApiResponse<InformeCasosPorEstado[]>> {
  //   return this.obtenerInformeCasosPorEstado();
  // }
  // async generarInformeCasosPorFiscal(filtros: FiltrosFechas = {}): Promise<ApiResponse<InformeCasosPorFiscal[]>> {
  //   return this.obtenerInformeCasosPorFiscal(filtros);
  // }
  
  // Descargar un informe por su ID
  async descargarInforme(idInforme: number): Promise<ApiResponse<Blob>> {
    try {
      const response = await apiClient.get<Blob>(`/informes/${idInforme}/descargar`, {
        responseType: 'blob'
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al descargar informe');
    }
  }
}

export const informeService = new InformeService();
