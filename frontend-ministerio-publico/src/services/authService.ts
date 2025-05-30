import { apiClient } from './apiClient';
import { 
  AuthResponse, 
  LoginForm, 
  RegisterForm, 
  Usuario, 
  ChangePasswordForm,
  ApiResponse,
  Fiscalia
} from '../types';

export class AuthService {
  async login(credentials: LoginForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data) {
        // Guardar tokens en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.usuario));
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  }

  async register(userData: RegisterForm): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar usuario');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continuar con el logout incluso si la API falla
      console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
      // Limpiar tokens del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getProfile(): Promise<ApiResponse<Usuario>> {
    try {
      const response = await apiClient.get<Usuario>('/auth/profile');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener perfil');
    }
  }

  async verifyToken(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>('/auth/verify');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token inválido');
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh');
      
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al refrescar token');
    }
  }

  async changePassword(passwordData: ChangePasswordForm): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<any>('/auth/change-password', {
        passwordActual: passwordData.passwordActual,
        passwordNuevo: passwordData.passwordNuevo
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  }

  // Get available fiscalías for registration
  async getFiscalias(): Promise<ApiResponse<Fiscalia[]>> {
    try {
      const response = await apiClient.get<Fiscalia[]>('/fiscalias');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener fiscalías');
    }
  }

  // Métodos de utilidad
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): Usuario | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();
