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
  idEstado: number;
  idFiscalAsignado?: number;
  idUsuarioCreador: number;
  estado?: EstadoCasoType;
  fiscalAsignado?: Usuario;
  fiscal?: Fiscal; // Alternative property name
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

export interface CasoForm {
  numeroCaso: string;
  titulo: string;
  descripcion?: string;
  idEstado: number;
  idFiscalAsignado?: number;
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
