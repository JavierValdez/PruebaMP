import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Usuario, AuthState } from '../types';
import { authService } from '../services/authService';

// Tipos para las acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: Usuario; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Usuario };

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// Reducer para manejar el estado de autenticación
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Contexto de autenticación
interface AuthContextType {
  state: AuthState;
  login: (nombreUsuario: string, password: string) => Promise<void>;
  loginWithToken: (user: Usuario, token: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Usuario) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      dispatch({ type: 'AUTH_START' });

      const token = authService.getToken();
      const user = authService.getCurrentUser();

      if (token && user) {
        // Verificar que el token sea válido
        await authService.verifyToken();
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      // Token inválido o expirado
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const login = async (nombreUsuario: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_START' });

      const response = await authService.login({ nombreUsuario, password });
      
      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: response.data.usuario,
            token: response.data.token,
          },
        });
      } else {
        throw new Error(response.message || 'Error al iniciar sesión');
      }
    } catch (error: any) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error.message || 'Error al iniciar sesión',
      });
      throw error;
    }
  };

  const loginWithToken = (user: Usuario, token: string) => {
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user, token },
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  const updateUser = (user: Usuario) => {
    dispatch({ type: 'AUTH_UPDATE_USER', payload: user });
  };

  const value: AuthContextType = {
    state,
    login,
    loginWithToken,
    logout,
    clearError,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
