import React from 'react';
import AuthTestComponent from '../components/auth/AuthTestComponent';

const AuthTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🔐 Pruebas de Autenticación - Ministerio Público
          </h1>
          <p className="text-gray-600">
            Panel de pruebas para verificar todos los endpoints de autenticación
          </p>
        </div>
        
        <AuthTestComponent />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            📋 Endpoints Probados:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Funcionalidades Principales:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code>GET /health</code> - Health Check</li>
                <li>• <code>POST /api/auth/register</code> - Registro</li>
                <li>• <code>POST /api/auth/login</code> - Inicio de sesión</li>
                <li>• <code>GET /api/auth/verify</code> - Verificar token</li>
                <li>• <code>GET /api/auth/profile</code> - Obtener perfil</li>
                <li>• <code>POST /api/auth/change-password</code> - Cambiar contraseña</li>
                <li>• <code>POST /api/auth/refresh</code> - Refrescar token</li>
                <li>• <code>POST /api/auth/logout</code> - Cerrar sesión</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Pruebas de Seguridad:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Login con credenciales incorrectas</li>
                <li>• Acceso sin token de autenticación</li>
                <li>• Uso de tokens inválidos</li>
                <li>• Validación de cambio de contraseña</li>
                <li>• Invalidación de contraseñas anteriores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
