import { useState } from 'react';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';

export interface TestResult {
  timestamp: string;
  message: string;
  success: boolean;
}

export const useAuthTests = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string, success: boolean = true) => {
    const result: TestResult = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      success
    };
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runHealthCheck = async () => {
    addResult('🏥 Ejecutando Health Check...');
    try {
      const response = await apiClient.healthCheck();
      addResult(`✅ Health Check exitoso: ${JSON.stringify(response)}`, true);
      return true;
    } catch (error: any) {
      addResult(`❌ Health Check falló: ${error.message}`, false);
      return false;
    }
  };

  const runRegistrationTest = async () => {
    addResult('👤 Registrando usuario de prueba...');
    try {
      const response = await authService.register({
        nombreUsuario: 'test_user_frontend',
        password: 'TestPassword123',
        email: 'test.frontend@mp.gov',
        primerNombre: 'Usuario',
        segundoNombre: 'De',
        primerApellido: 'Prueba',
        segundoApellido: 'Frontend',
        idFiscalia: 1
      });
      
      if (response.success) {
        addResult(`✅ Registro exitoso: ${response.message}`, true);
        return true;
      } else {
        addResult(`❌ Registro falló: ${response.message}`, false);
        return false;
      }
    } catch (error: any) {
      // El usuario puede ya existir, eso está bien para las pruebas
      addResult(`⚠️ Registro: ${error.message} (usuario puede ya existir)`, true);
      return true;
    }
  };

  const runLoginTest = async (username: string, password: string) => {
    addResult(`🔐 Iniciando sesión con ${username}...`);
    try {
      const response = await authService.login({ nombreUsuario: username, password });
      
      if (response.success && response.data) {
        addResult(`✅ Login exitoso para ${username}`, true);
        return response.data;
      } else {
        addResult(`❌ Login falló: ${response.message}`, false);
        return null;
      }
    } catch (error: any) {
      addResult(`❌ Login falló: ${error.message}`, false);
      return null;
    }
  };

  const runTokenVerificationTest = async () => {
    addResult('🔍 Verificando token...');
    try {
      const response = await authService.verifyToken();
      
      if (response.success) {
        addResult(`✅ Token válido: ${response.message}`, true);
        return true;
      } else {
        addResult(`❌ Token inválido: ${response.message}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Verificación de token falló: ${error.message}`, false);
      return false;
    }
  };

  const runProfileTest = async () => {
    addResult('👥 Obteniendo perfil de usuario...');
    try {
      const response = await authService.getProfile();
      
      if (response.success && response.data) {
        addResult(`✅ Perfil obtenido: ${response.data.nombreUsuario} (${response.data.email})`, true);
        return response.data;
      } else {
        addResult(`❌ Error obteniendo perfil: ${response.message}`, false);
        return null;
      }
    } catch (error: any) {
      addResult(`❌ Error obteniendo perfil: ${error.message}`, false);
      return null;
    }
  };

  const runChangePasswordTest = async (currentPassword: string, newPassword: string) => {
    addResult('🔑 Cambiando contraseña...');
    try {
      const response = await authService.changePassword({
        passwordActual: currentPassword,
        passwordNuevo: newPassword,
        confirmarPassword: newPassword
      });
      
      if (response.success) {
        addResult(`✅ Contraseña cambiada exitosamente: ${response.message}`, true);
        return true;
      } else {
        addResult(`❌ Error cambiando contraseña: ${response.message}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Error cambiando contraseña: ${error.message}`, false);
      return false;
    }
  };

  const runRefreshTokenTest = async () => {
    addResult('🔄 Refrescando token...');
    try {
      const response = await authService.refreshToken();
      
      if (response.success) {
        addResult(`✅ Token refrescado exitosamente: ${response.message}`, true);
        return true;
      } else {
        addResult(`❌ Error refrescando token: ${response.message}`, false);
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Error refrescando token: ${error.message}`, false);
      return false;
    }
  };

  const runLogoutTest = async () => {
    addResult('🚪 Cerrando sesión...');
    try {
      await authService.logout();
      addResult('✅ Logout exitoso', true);
      return true;
    } catch (error: any) {
      addResult(`❌ Error en logout: ${error.message}`, false);
      return false;
    }
  };

  const runErrorTests = async () => {
    setLoading(true);
    addResult('🧪 Iniciando pruebas de casos de error...');

    // 1. Login con credenciales incorrectas
    addResult('❌ Probando login con credenciales incorrectas...');
    const badLoginResult = await runLoginTest('usuario_inexistente', 'password_incorrecto');
    if (!badLoginResult) {
      addResult('✅ Login con credenciales incorrectas falló correctamente', true);
    } else {
      addResult('❌ ERROR: Login con credenciales incorrectas fue exitoso', false);
    }

    // 2. Acceso sin token
    addResult('🚫 Probando acceso sin token...');
    const originalToken = localStorage.getItem('token');
    localStorage.removeItem('token');
    
    try {
      await authService.getProfile();
      addResult('❌ ERROR: Acceso sin token fue permitido', false);
    } catch (error: any) {
      addResult(`✅ Acceso sin token rechazado correctamente: ${error.message}`, true);
    }

    // 3. Token inválido
    addResult('🔐 Probando con token inválido...');
    localStorage.setItem('token', 'token_invalido_123');
    
    try {
      await authService.getProfile();
      addResult('❌ ERROR: Token inválido fue aceptado', false);
    } catch (error: any) {
      addResult(`✅ Token inválido rechazado correctamente: ${error.message}`, true);
    }

    // Restaurar token original si existía
    if (originalToken) {
      localStorage.setItem('token', originalToken);
    } else {
      localStorage.removeItem('token');
    }

    addResult('🏁 Pruebas de error completadas');
    setLoading(false);
  };

  const runCompleteTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult('🚀 Iniciando suite completa de pruebas de autenticación...');

    try {
      // 1. Health Check
      await runHealthCheck();

      // 2. Registro
      await runRegistrationTest();

      // 3. Login inicial
      const loginData = await runLoginTest('test_user_frontend', 'TestPassword123');
      if (!loginData) {
        addResult('❌ No se puede continuar sin login exitoso', false);
        setLoading(false);
        return;
      }

      // 4. Verificar token
      await runTokenVerificationTest();

      // 5. Obtener perfil
      await runProfileTest();

      // 6. Cambiar contraseña
      const passwordChanged = await runChangePasswordTest('TestPassword123', 'NewTestPassword456');
      
      if (passwordChanged) {
        // 7. Logout y re-login con nueva contraseña
        await runLogoutTest();
        
        addResult('🔐 Verificando login con nueva contraseña...');
        const newLoginData = await runLoginTest('test_user_frontend', 'NewTestPassword456');
        
        if (newLoginData) {
          addResult('✅ Login con nueva contraseña exitoso', true);
          
          // 8. Verificar que contraseña anterior no funciona
          await runLogoutTest();
          addResult('🚫 Verificando que contraseña anterior no funciona...');
          const oldPasswordResult = await runLoginTest('test_user_frontend', 'TestPassword123');
          
          if (!oldPasswordResult) {
            addResult('✅ Contraseña anterior correctamente invalidada', true);
          } else {
            addResult('❌ ERROR: La contraseña anterior aún funciona', false);
          }

          // 9. Login final para pruebas restantes
          await runLoginTest('test_user_frontend', 'NewTestPassword456');
          
          // 10. Refresh token
          await runRefreshTokenTest();
          
          // 11. Logout final
          await runLogoutTest();
        }
      }

      addResult('🎉 Suite completa de pruebas terminada');
      
    } catch (error: any) {
      addResult(`❌ Error general en las pruebas: ${error.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    runCompleteTests,
    runErrorTests,
    clearResults,
    runHealthCheck,
    runRegistrationTest,
    runLoginTest,
    runTokenVerificationTest,
    runProfileTest,
    runChangePasswordTest,
    runRefreshTokenTest,
    runLogoutTest
  };
};
