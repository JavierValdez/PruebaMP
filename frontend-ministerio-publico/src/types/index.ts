// Interfaces para la API del Ministerio Público

export interface Usuario {
  idUsuario: number;
  nombreUsuario: string;
  email: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  idFiscalia: number;
  fechaCreacion: string;
  activo: boolean;
  rol?: Rol;
  fiscalia?: Fiscalia;
}

export interface Rol {
  idRol: number;
  nombreRol: string;
  descripcion?: string;
  permisos?: Permiso[];
}

export interface Permiso {
  idPermiso: number;
  nombrePermiso: string;
  descripcion?: string;
}

export interface Fiscalia {
  idFiscalia: number;
  nombreFiscalia: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export interface Caso {
  id: number;
  idCaso: number;
  numeroCaso: string;
  numeroExpediente: string; // Alias for numeroCaso
  titulo: string;
  descripcion?: string;
  fechaCreacion: string;
  fechaAsignacion?: string;
  idEstado?: number; // Puede ser undefined si no viene de backend
  nombreEstado?: string; // Nuevo: nombre del estado directo del backend
  idFiscalAsignado?: number;
  idUsuarioCreador: number;
  estado?: EstadoCasoType;
  fiscalAsignado?: Usuario;
  fiscal?: Fiscal; // Alternative property name
  fiscalPrimerNombre?: string; // Para mostrar directo si no hay id
  fiscalPrimerApellido?: string;
  usuarioCreador?: Usuario;
}

// Estado as string enum
export type EstadoCasoType = 
  | 'ACTIVO'
  | 'EN_INVESTIGACION'
  | 'EN_PROCESO'
  | 'CERRADO'
  | 'ARCHIVADO';

export interface EstadoCaso {
  idEstado: number;
  nombreEstado: string;
  descripcion?: string;
  color?: string;
}

export interface Fiscal {
  idFiscal: number;
  nombres: string; // Combined first and second names
  apellidos: string; // Combined last names  
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  email?: string;
  especialidad?: string;
  activo: boolean;
}

// Interfaces para formularios
export interface LoginForm {
  nombreUsuario: string;
  password: string;
}

export interface RegisterForm {
  nombreUsuario: string;
  password: string;
  email: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  idFiscalia: number;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface CasoForm {
  numeroCaso: string;
  titulo?: string;
  descripcion: string;
  idEstado: number;
  idEstadoCaso?: number; // Para compatibilidad con backend
  idFiscalAsignado?: number | null;
  detalleProgreso?: string;
}

export interface ChangePasswordForm {
  passwordActual: string;
  passwordNuevo: string;
  confirmarPassword: string;
}

// Interfaces para respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  usuario: Usuario;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interfaces específicas para respuestas de la API (con nombres en PascalCase)
export interface CasoAPI {
  IdCaso: number;
  NumeroCasoUnico: string;
  Descripcion?: string;
  Titulo?: string;
  FechaCreacion: string;
  FechaUltimaActualizacion?: string;
  FechaAsignacion?: string;
  IdEstadoCaso?: number;
  NombreEstadoCaso?: string;
  DetalleProgreso?: string;
  IdFiscalAsignado?: number;
  FiscalPrimerNombre?: string;
  FiscalPrimerApellido?: string;
  FiscalNombreUsuario?: string;
  FiscalNombreFiscalia?: string;
  IdUsuarioCreador?: number;
  UsuarioCreacionNombreUsuario?: string;
  UsuarioModificacionNombreUsuario?: string;
}

export interface PaginatedResponseAPI<T> {
  casos: T[];
  paginacion: {
    paginaActual: number;
    resultadosPorPagina: number;
    totalResultados: number;
    totalPaginas: number;
  };
}

export interface EstadoCasoAPI {
  IdEstadoCaso: number;
  NombreEstado: string;
  DescripcionEstado?: string;
}

export interface FiscalAPI {
  IdFiscal: number;
  PrimerNombre: string;
  SegundoNombre?: string;
  PrimerApellido: string;
  SegundoApellido?: string;
  Email?: string;
  Activo: boolean;
}

// Interfaces para estadísticas y reportes
export interface EstadisticasCasos {
  totalCasos: number;
  casosPorEstado: { [key: string]: number };
  casosPorFiscal: { [key: string]: number };
  casosCreados: {
    hoy: number;
    semana: number;
    mes: number;
  };
}

// Interfaces para filtros
export interface FiltrosCasos {
  busqueda?: string;
  idEstado?: number;
  idFiscal?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

// Tipos para el estado de autenticación
export interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Tipos para el estado de casos
export interface CasosState {
  casos: Caso[];
  casoActual: Caso | null;
  estados: EstadoCaso[];
  fiscales: Fiscal[];
  loading: boolean;
  error: string | null;
  filtros: FiltrosCasos;
  total: number;
  page: number;
  totalPages: number;
}

// Tipos para notificaciones
export interface Notificacion {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
  timestamp: Date;
}

export interface AppState {
  auth: AuthState;
  casos: CasosState;
  notificaciones: Notificacion[];
}

export interface Informe {
  idInforme: number;
  tipoInforme: string;
  fechaGeneracion: string;
  fechaInicio?: string;
  fechaFin?: string;
  estado: string;
  parametros?: Record<string, any>;
  idUsuarioGenerador: number;
}

// Interfaces para Dashboard
export interface CasoPorEstado {
  EstadoCaso: string;
  TotalCasos: number;
}

export interface CasoPorFiscal {
  Fiscalia: string;
  CasosAsignados: number;
  [key: string]: any;
}

export interface EstadisticasGenerales {
  resumen: {
    totalCasos: number;
    fiscalesActivos: number;
    promedioCasosPorFiscal: number;
  };
  casosPorEstado: CasoPorEstado[];
  casosPorFiscal: CasoPorFiscal[];
}

export interface MetricasAdicionales {
  casosNuevosEsteMes: number;
  casosCerradosEsteMes: number;
  casosPendientes: number;
  intentosReasignacionFallidosEsteMes: number;
}

export interface DashboardDataBackend {
  titulo: string;
  fechaActualizacion: string;
  estadisticasGenerales: EstadisticasGenerales;
  metricas: MetricasAdicionales;
}


