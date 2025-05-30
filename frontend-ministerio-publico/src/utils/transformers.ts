import { 
  Caso, 
  EstadoCaso, 
  Fiscal, 
  PaginatedResponse,
  CasoAPI, 
  EstadoCasoAPI, 
  FiscalAPI, 
  PaginatedResponseAPI 
} from '../types';

// Transformadores para convertir respuestas de la API al formato del frontend

export const transformarCasoAPI = (casoAPI: CasoAPI): Caso => {
  return {
    id: casoAPI.IdCaso,
    idCaso: casoAPI.IdCaso,
    numeroCaso: casoAPI.NumeroCasoUnico,
    numeroExpediente: casoAPI.NumeroCasoUnico,
    titulo: casoAPI.Titulo || casoAPI.Descripcion || '',
    descripcion: casoAPI.Descripcion || '',
    fechaCreacion: casoAPI.FechaCreacion,
    fechaAsignacion: casoAPI.FechaAsignacion,
    idEstado: casoAPI.IdEstadoCaso || 1, // Default estado si no viene
    idFiscalAsignado: casoAPI.IdFiscalAsignado || undefined,
    idUsuarioCreador: casoAPI.IdUsuarioCreador || 0,
    // Campos adicionales opcionales
    fiscal: (casoAPI.FiscalPrimerNombre && casoAPI.FiscalPrimerApellido) ? {
      idFiscal: casoAPI.IdFiscalAsignado || 0,
      primerNombre: casoAPI.FiscalPrimerNombre,
      segundoNombre: '',
      primerApellido: casoAPI.FiscalPrimerApellido,
      segundoApellido: '',
      nombres: `${casoAPI.FiscalPrimerNombre}`,
      apellidos: casoAPI.FiscalPrimerApellido,
      activo: true,
    } : undefined,
  };
};

export const transformarEstadoCasoAPI = (estadoAPI: EstadoCasoAPI): EstadoCaso => {
  return {
    idEstado: estadoAPI.IdEstadoCaso,
    nombreEstado: estadoAPI.NombreEstado,
    descripcion: estadoAPI.DescripcionEstado,
  };
};

export const transformarFiscalAPI = (fiscalAPI: FiscalAPI): Fiscal => {
  return {
    idFiscal: fiscalAPI.IdFiscal,
    primerNombre: fiscalAPI.PrimerNombre,
    segundoNombre: fiscalAPI.SegundoNombre,
    primerApellido: fiscalAPI.PrimerApellido,
    segundoApellido: fiscalAPI.SegundoApellido,
    nombres: `${fiscalAPI.PrimerNombre} ${fiscalAPI.SegundoNombre || ''}`.trim(),
    apellidos: `${fiscalAPI.PrimerApellido} ${fiscalAPI.SegundoApellido || ''}`.trim(),
    email: fiscalAPI.Email,
    activo: fiscalAPI.Activo,
  };
};

export const transformarPaginatedResponseAPI = <T, U>(
  responseAPI: PaginatedResponseAPI<T>,
  transformItem: (item: T) => U
): PaginatedResponse<U> => {
  return {
    data: responseAPI.casos.map(transformItem),
    total: responseAPI.paginacion.totalResultados,
    page: responseAPI.paginacion.paginaActual,
    limit: responseAPI.paginacion.resultadosPorPagina,
    totalPages: responseAPI.paginacion.totalPaginas,
  };
};
