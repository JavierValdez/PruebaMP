# 🔐 Sistema de Autenticación - Ministerio Público

Este proyecto implementa un sistema completo de autenticación para el frontend del Ministerio Público con todas las funcionalidades requeridas.

## 🚀 Funcionalidades Implementadas

### Métodos de Autenticación
- ✅ **Registro de usuarios** (`POST /api/auth/register`)
- ✅ **Inicio de sesión** (`POST /api/auth/login`)
- ✅ **Verificación de token** (`GET /api/auth/verify`)
- ✅ **Obtener perfil** (`GET /api/auth/profile`)
- ✅ **Cambio de contraseña** (`POST /api/auth/change-password`)
- ✅ **Refresh de tokens** (`POST /api/auth/refresh`)
- ✅ **Cerrar sesión** (`POST /api/auth/logout`)
- ✅ **Health check** (`GET /health`)

### Características de Seguridad
- 🔒 **JWT Tokens** con access y refresh tokens
- 🛡️ **Interceptores automáticos** para refresh de tokens
- 🚫 **Validación de credenciales** y manejo de errores
- 🔄 **Auto-renovación de tokens** expirados
- 🧹 **Limpieza automática** de tokens en logout

## 📁 Estructura de Archivos

```
src/
├── components/
│   └── auth/
│       ├── AuthTestComponent.tsx      # Componente de pruebas
│       ├── LoginComponent.tsx         # Componente de login
│       └── RegisterComponent.tsx      # Componente de registro
├── contexts/
│   └── AuthContext.tsx               # Context de autenticación
├── hooks/
│   └── useAuthTests.ts               # Hook para pruebas de auth
├── pages/
│   └── AuthTestPage.tsx              # Página de pruebas
├── services/
│   ├── apiClient.ts                  # Cliente HTTP con interceptores
│   └── authService.ts                # Servicio de autenticación
└── types/
    └── index.ts                      # Tipos TypeScript
```

## 🧪 Panel de Pruebas

### Acceso al Panel
Para probar todos los métodos de autenticación, visita:
```
http://localhost:3000/auth-test
```

### Tipos de Pruebas

#### 1. **Suite Completa** 🚀
Ejecuta todas las pruebas en secuencia:
- Health check del servidor
- Registro de usuario de prueba
- Login con credenciales
- Verificación de token
- Obtención de perfil
- Cambio de contraseña
- Verificación con nueva contraseña
- Validación de contraseña anterior
- Refresh de token
- Logout

#### 2. **Casos de Error** 💥
Prueba escenarios de error:
- Login con credenciales incorrectas
- Acceso sin token
- Uso de tokens inválidos

#### 3. **Pruebas Rápidas** 🔍
Ejecuta pruebas básicas individuales sin modificar datos

## ⚙️ Configuración

### Variables de Entorno
Crea un archivo `.env` con:
```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_API_HOST=http://localhost:3001
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true
```

### Instalación
```bash
npm install
npm start
```

## 🔧 Uso del Sistema

### AuthService
```typescript
import { authService } from './services/authService';

// Login
const response = await authService.login({
  nombreUsuario: 'usuario',
  password: 'contraseña'
});

// Obtener perfil
const profile = await authService.getProfile();

// Cambiar contraseña
await authService.changePassword({
  passwordActual: 'actual',
  passwordNuevo: 'nueva',
  confirmarPassword: 'nueva'
});
```

### Uso del Context
```typescript
import { useAuth } from './contexts/AuthContext';

const { state, login, logout } = useAuth();

// Verificar si está autenticado
if (state.isAuthenticated) {
  console.log('Usuario:', state.user);
}
```

## 🧪 Script de Pruebas Bash Equivalente

Tu script bash de pruebas es completamente compatible con este frontend. Los endpoints que prueba el script son:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/verify`
- `GET /api/auth/profile`
- `POST /api/auth/change-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## 🔍 Debugging

### Verificar Estado de Autenticación
El panel de pruebas muestra en tiempo real:
- ✅ **Pruebas Exitosas**: Contador verde
- ❌ **Pruebas Fallidas**: Contador rojo
- 📊 **Total Ejecutadas**: Contador azul

### Logs de Consola
Todos los errores se logean en la consola del navegador para debugging.

### Token Storage
Los tokens se almacenan en `localStorage`:
- `token`: Access token JWT
- `refreshToken`: Refresh token JWT
- `user`: Datos del usuario autenticado

## 🚨 Manejo de Errores

El sistema maneja automáticamente:
- **Tokens expirados**: Auto-refresh silencioso
- **Credenciales inválidas**: Mensajes de error claros
- **Conexión perdida**: Reintentos automáticos
- **Logout forzado**: Limpieza completa de estado

## 📝 Notas de Desarrollo

- Los interceptores de Axios manejan automáticamente el refresh de tokens
- El AuthContext mantiene el estado global de autenticación
- Todos los métodos son async/await con manejo de errores
- Compatible con el script de pruebas bash proporcionado
- Implementa las mejores prácticas de seguridad frontend

¡El sistema está listo para probar todos los endpoints de tu API! 🎉
