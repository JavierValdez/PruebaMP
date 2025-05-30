import { apiClient } from './apiClient';
import { 
  Caso, 
  CasoForm, 
  EstadoCaso, 
  Fiscal, 
  FiltrosCasos,
  PaginatedResponse,
  EstadisticasCasos,
  ApiResponse 
} from '../types';

export class CasoService {
  // Alias for compatibility
  async getCasos(filtros: any = {}): Promise<ApiResponse<any>> {
    return this.listarCasos(filtros);
  }

  // Listar casos con paginación y filtros
  async listarCasos(filtros: FiltrosCasos = {}): Promise<ApiResponse<PaginatedResponse<Caso>>> {
    try {
      const params = {
        page: filtros.page || 1,
        limit: filtros.limit || 10,
        busqueda: filtros.busqueda,
        idEstado: filtros.idEstado,
        idFiscal: filtros.idFiscal,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta
      };

      // Filtrar parámetros undefined
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.get<PaginatedResponse<Caso>>('/casos', filteredParams);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos');
    }
  }

  // Obtener un caso por ID
  async obtenerCaso(id: number): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.get<Caso>(`/casos/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener caso');
    }
  }

  // Crear nuevo caso
  async crearCaso(caso: CasoForm): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.post<Caso>('/casos', caso);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear caso');
    }
  }

  // Actualizar caso
  async actualizarCaso(id: number, caso: Partial<CasoForm>): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.put<Caso>(`/casos/${id}`, caso);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar caso');
    }
  }

  // Buscar casos
  async buscarCasos(termino: string): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>('/casos/buscar', { termino });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar casos');
    }
  }

  // Obtener mis casos asignados
  async obtenerMisCasos(): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>('/casos/mis-casos');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mis casos');
    }
  }

  // Obtener casos por fiscal
  async obtenerCasosPorFiscal(idFiscal: number): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>(`/casos/fiscal/${idFiscal}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos del fiscal');
    }
  }

  // Obtener casos por estado
  async obtenerCasosPorEstado(idEstado: number): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>(`/casos/estado/${idEstado}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos por estado');
    }
  }

  // Asignar fiscal a caso
  async asignarFiscal(idCaso: number, idFiscal: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(`/casos/${idCaso}/asignar-fiscal`, { idFiscal });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al asignar fiscal');
    }
  }

  // Reasignar fiscal de caso
  async reasignarFiscal(idCaso: number, idFiscalNuevo: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(`/casos/${idCaso}/reasignar-fiscal`, { 
        idFiscalNuevo 
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al reasignar fiscal');
    }
  }

  // Obtener estados disponibles
  async obtenerEstados(): Promise<ApiResponse<EstadoCaso[]>> {
    try {
      const response = await apiClient.get<EstadoCaso[]>('/casos/estados');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estados');
    }
  }

  // Obtener fiscales disponibles
  async obtenerFiscales(): Promise<ApiResponse<Fiscal[]>> {
    try {
      const response = await apiClient.get<Fiscal[]>('/fiscales');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener fiscales');
    }
  }

  // Obtener estadísticas de casos
  async obtenerEstadisticas(): Promise<ApiResponse<EstadisticasCasos>> {
    try {
      const response = await apiClient.get<EstadisticasCasos>('/casos/estadisticas');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  }
}

export const casoService = new CasoService();
