import axios from 'axios';
import { ApiResponse } from '../types';

class ApiClient {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token a las requests
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar respuestas y errores
    this.api.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        const originalRequest = error.config;

        // Si el token ha expirado, intentar refrescarlo
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api'}/auth/refresh`,
                { refreshToken },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              const responseData = response.data as ApiResponse<{ token: string }>;
              if (responseData.success && responseData.data) {
                const { token } = responseData.data;
                localStorage.setItem('token', token);

                // Reintentar la request original
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.api(originalRequest);
              }
            }
          } catch (refreshError) {
            // Si falla el refresh, limpiar tokens y redirigir al login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Métodos HTTP genéricos
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url);
    return response.data;
  }

  // Método para health check
  async healthCheck(): Promise<any> {
    const response = await axios.get(`${process.env.REACT_APP_API_HOST || 'http://localhost:3001'}/health`);
    return response.data as any;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
