import { apiClient } from './apiClient';
import { 
  Caso, 
  CasoForm, 
  EstadoCaso, 
  Fiscal, 
  FiltrosCasos,
  PaginatedResponse,
  EstadisticasCasos,
  ApiResponse,
  CasoAPI,
  EstadoCasoAPI,
  FiscalAPI,
  PaginatedResponseAPI
} from '../types';
import { 
  transformarCasoAPI, 
  transformarEstadoCasoAPI, 
  transformarFiscalAPI, 
  transformarPaginatedResponseAPI 
} from '../utils/transformers';

export class CasoService {
  // Alias for compatibility
  async getCasos(filtros: any = {}): Promise<ApiResponse<any>> {
    return this.listarCasos(filtros);
  }

  // Listar casos con paginación y filtros
  // Endpoint: GET /api/casos
  async listarCasos(filtros: FiltrosCasos = {}): Promise<ApiResponse<PaginatedResponse<Caso>>> {
    try {
      const params = {
        pagina: filtros.page || 1, // API usa 'pagina' no 'page'
        resultadosPorPagina: filtros.limit || 10, // API usa 'resultadosPorPagina' no 'limit'
        busqueda: filtros.busqueda,
        idEstadoCaso: filtros.idEstado, // API usa 'idEstadoCaso'
        idFiscalAsignado: filtros.idFiscal, // API usa 'idFiscalAsignado'
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta
      };

      // Filtrar parámetros undefined
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      const response = await apiClient.get<PaginatedResponseAPI<CasoAPI>>('/casos', filteredParams);
      
      if (response.success && response.data) {
        // Transform API response to frontend format
        const transformedData = transformarPaginatedResponseAPI(response.data, transformarCasoAPI);
        return {
          success: true,
          data: transformedData,
          message: response.message
        };
      }
      
      return {
        success: false,
        data: undefined,
        message: response.message || 'Error al obtener casos'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos');
    }
  }

  // Obtener un caso por ID
  // Endpoint: GET /api/casos/:id
  async obtenerCaso(id: number): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.get<Caso>(`/casos/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener caso');
    }
  }

  // Crear nuevo caso
  // Endpoint: POST /api/casos
  async crearCaso(caso: CasoForm): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.post<Caso>('/casos', caso);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear caso');
    }
  }

  // Actualizar caso (actualizaciones parciales permitidas)
  // Endpoint: PUT /api/casos/:id
  async actualizarCaso(id: number, caso: Partial<CasoForm>): Promise<ApiResponse<Caso>> {
    try {
      const response = await apiClient.put<Caso>(`/casos/${id}`, caso);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar caso');
    }
  }

  // Buscar casos por término
  // Endpoint: GET /api/casos/buscar?termino=XXX
  async buscarCasos(termino: string): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>('/casos/buscar', { termino });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar casos');
    }
  }

  // Obtener mis casos asignados
  // Endpoint: GET /api/casos/mis-casos
  async obtenerMisCasos(): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>('/casos/mis-casos');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener mis casos');
    }
  }

  // Obtener casos por fiscal
  // Endpoint: GET /api/casos/fiscal/:idFiscal
  async obtenerCasosPorFiscal(idFiscal: number): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>(`/casos/fiscal/${idFiscal}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos del fiscal');
    }
  }

  // Obtener casos por estado
  // Endpoint: GET /api/casos/estado/:idEstado
  async obtenerCasosPorEstado(idEstado: number): Promise<ApiResponse<Caso[]>> {
    try {
      const response = await apiClient.get<Caso[]>(`/casos/estado/${idEstado}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener casos por estado');
    }
  }

  // Asignar fiscal a caso
  // Endpoint: POST /api/casos/:id/asignar-fiscal
  async asignarFiscal(idCaso: number, idFiscal: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>(`/casos/${idCaso}/asignar-fiscal`, { idFiscal });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al asignar fiscal');
    }
  }

  // Reasignar fiscal de caso
  // Endpoint: POST /api/casos/:id/reasignar-fiscal
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
  // Endpoint: GET /api/casos/estados
  async obtenerEstados(): Promise<ApiResponse<EstadoCaso[]>> {
    try {
      const response = await apiClient.get<EstadoCasoAPI[]>('/casos/estados');
      
      if (response.success && response.data) {
        // Transform API response to frontend format
        const transformedData = response.data.map(transformarEstadoCasoAPI);
        return {
          success: true,
          data: transformedData,
          message: response.message
        };
      }
      
      return {
        success: false,
        data: undefined,
        message: response.message || 'Error al obtener estados'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estados');
    }
  }

  // Obtener fiscales disponibles
  // Endpoint: GET /api/casos/fiscales (corregido desde /fiscales)
  async obtenerFiscales(): Promise<ApiResponse<Fiscal[]>> {
    try {
      const response = await apiClient.get<FiscalAPI[]>('/casos/fiscales');
      
      if (response.success && response.data) {
        // Transform API response to frontend format
        const transformedData = response.data.map(transformarFiscalAPI);
        return {
          success: true,
          data: transformedData,
          message: response.message
        };
      }
      
      return {
        success: false,
        data: undefined,
        message: response.message || 'Error al obtener fiscales'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener fiscales');
    }
  }

  // Obtener estadísticas de casos
  // Endpoint: GET /api/casos/estadisticas
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
