import { useAuth } from '../contexts/AuthContext';
import { Permiso } from '../types';

export const usePermisos = () => {
  const { state } = useAuth();
  const { user } = state;

  const tienePermiso = (permiso: string): boolean => {
    // En modo desarrollo, dar permisos básicos si está autenticado
    if (state.isAuthenticated && !user?.rol?.permisos) {
      const permisosDesarrollo = [
        'CASE_VIEW', 'CASE_VIEW_ALL', 'CASE_VIEW_OWN',
        'CASE_CREATE', 'CASE_EDIT', 'CASE_DELETE',
        'CASE_ASSIGN', 'CASE_REASSIGN', 'CASE_STATS'
      ];
      return permisosDesarrollo.includes(permiso);
    }

    if (!user || !user.rol || !user.rol.permisos) {
      return false;
    }

    return user.rol.permisos.some((p: Permiso) => p.nombrePermiso === permiso);
  };

  const permisos = {
    // Permisos de casos
    CASE_VIEW: tienePermiso('CASE_VIEW'),
    CASE_VIEW_OWN: tienePermiso('CASE_VIEW_OWN'),
    CASE_VIEW_ALL: tienePermiso('CASE_VIEW_ALL'),
    CASE_CREATE: tienePermiso('CASE_CREATE'),
    CASE_EDIT: tienePermiso('CASE_EDIT'),
    CASE_DELETE: tienePermiso('CASE_DELETE'),
    CASE_ASSIGN: tienePermiso('CASE_ASSIGN'),
    CASE_REASSIGN: tienePermiso('CASE_REASSIGN'),
    CASE_STATS: tienePermiso('CASE_STATS'),
    
    // Permisos de usuarios
    USER_VIEW: tienePermiso('USER_VIEW'),
    USER_CREATE: tienePermiso('USER_CREATE'),
    USER_EDIT: tienePermiso('USER_EDIT'),
    USER_DELETE: tienePermiso('USER_DELETE'),
    
    // Permisos de administración
    ADMIN_PANEL: tienePermiso('ADMIN_PANEL'),
    SYSTEM_CONFIG: tienePermiso('SYSTEM_CONFIG'),
  };

  return {
    tienePermiso,
    permisos,
    user,
    isAuthenticated: state.isAuthenticated
  };
};

export default usePermisos;
