# 🔐 Guía de Pruebas del Login - API Ministerio Público

## 📋 Información del Servidor
- **URL Base**: http://localhost:3001
- **Puerto**: 3001
- **Base de datos**: PruebaMPDB2 (SQL Server)

## 🚀 Endpoints de Autenticación

### 1. **Health Check**
```http
GET http://localhost:3001/health
```
**Respuesta esperada**:
```json
{
  "success": true,
  "message": "API del Ministerio Público funcionando correctamente",
  "timestamp": "2025-05-30T05:22:29.908Z",
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. **Registro de Usuario**
```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nombreUsuario": "fiscal_prueba",
  "password": "123456",
  "email": "fiscal@mp.gov",
  "primerNombre": "Juan",
  "primerApellido": "Pérez",
  "idFiscalia": 1
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "idUsuario": 1,
    "nombreUsuario": "fiscal_prueba",
    "email": "fiscal@mp.gov",
    "primerNombre": "Juan",
    "primerApellido": "Pérez"
  }
}
```

### 3. **Login**
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "fiscal_prueba",
  "password": "123456"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "idUsuario": 1,
      "nombreUsuario": "fiscal_prueba",
      "email": "fiscal@mp.gov",
      "primerNombre": "Juan",
      "primerApellido": "Pérez",
      "roles": [],
      "permissions": []
    }
  }
}
```

### 4. **Obtener Perfil (Requiere Token)**
```http
GET http://localhost:3001/api/auth/profile
Content-Type: application/json
Authorization: Bearer [TOKEN_OBTENIDO_EN_LOGIN]
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "idUsuario": 1,
    "nombreUsuario": "fiscal_prueba",
    "email": "fiscal@mp.gov",
    "primerNombre": "Juan",
    "primerApellido": "Pérez",
    "roles": [],
    "permissions": []
  }
}
```

### 5. **Logout**
```http
POST http://localhost:3001/api/auth/logout
Content-Type: application/json
Authorization: Bearer [TOKEN_OBTENIDO_EN_LOGIN]
```

### 6. **Cambiar Contraseña**
```http
POST http://localhost:3001/api/auth/change-password
Content-Type: application/json
Authorization: Bearer [TOKEN_OBTENIDO_EN_LOGIN]

{
  "currentPassword": "123456",
  "newPassword": "nueva_contraseña_123"
}
```

## 🧪 Casos de Prueba

### ✅ Casos Exitosos
1. **Registro exitoso** - Crear usuario con datos válidos
2. **Login exitoso** - Autenticarse con credenciales válidas
3. **Acceso a perfil** - Obtener información del usuario autenticado
4. **Logout exitoso** - Cerrar sesión

### ❌ Casos de Error
1. **Login con contraseña incorrecta**:
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "fiscal_prueba",
  "password": "contraseña_incorrecta"
}
```

2. **Login con usuario inexistente**:
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "usuario_inexistente",
  "password": "123456"
}
```

3. **Acceso sin token**:
```http
GET http://localhost:3001/api/auth/profile
Content-Type: application/json
```

4. **Token inválido**:
```http
GET http://localhost:3001/api/auth/profile
Content-Type: application/json
Authorization: Bearer token_invalido
```

## 📝 Notas de Configuración

### Variables de Entorno (.env)
```
PORT=3001
DB_USER=sa
DB_PASSWORD=StrongP@ssword123
DB_SERVER=localhost
DB_DATABASE=PruebaMPDB2
DB_PORT=1433
JWT_SECRET=tu_secreto_super_secreto_para_jwt_ministerio_publico_2024
NODE_ENV=development
```

### Comandos para Ejecutar
```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

## 🔍 Herramientas Recomendadas
- **Postman**: Para pruebas de API
- **Insomnia**: Alternativa a Postman
- **curl**: Para pruebas desde terminal
- **VS Code REST Client**: Extensión para probar APIs desde VS Code

## 🛠️ Solución de Problemas

### Problema: Error de stored procedures
Si obtienes errores como "Could not find stored procedure", verifica:
1. Que la base de datos PruebaMPDB2 existe
2. Que el archivo setup.sql se ejecutó correctamente
3. Que la conexión apunta a la base de datos correcta

### Problema: Error de conexión a base de datos
1. Verifica que SQL Server esté corriendo
2. Confirma las credenciales en el archivo .env
3. Revisa que el puerto 1433 esté disponible

## ✅ Estado Actual
- ✅ Servidor iniciado correctamente (puerto 3001)
- ✅ Health check funcionando
- ✅ Registro de usuario exitoso
- ✅ Login básico funcionando
- ⚠️ Algunos stored procedures faltan en la base de datos
