# 🔐 Ejemplos Completos de Peticiones - Auth Controller

## 📋 Información General
- **URL Base**: `http://localhost:3001`
- **Prefijo de rutas**: `/api/auth`
- **Content-Type**: `application/json`

---

## 🚀 1. REGISTRO DE USUARIO
### `POST /api/auth/register`
**Acceso**: Público

### 📝 Ejemplo de Petición:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal_juan",
    "password": "MiPassword123",
    "email": "juan.perez@mp.gov",
    "primerNombre": "Juan",
    "segundoNombre": "Carlos",
    "primerApellido": "Pérez",
    "segundoApellido": "González",
    "idFiscalia": 1
  }'
```

### ✅ Respuesta Exitosa (201):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "idUsuario": 2,
    "nombreUsuario": "fiscal_juan",
    "email": "juan.perez@mp.gov",
    "primerNombre": "Juan",
    "primerApellido": "Pérez"
  }
}
```

### ❌ Respuesta de Error (400):
```json
{
  "success": false,
  "message": "El nombre de usuario ya existe",
  "code": "VALIDATION_ERROR"
}
```

---

## 🔑 2. INICIAR SESIÓN (LOGIN)
### `POST /api/auth/login`
**Acceso**: Público

### 📝 Ejemplo de Petición:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal_juan",
    "password": "MiPassword123"
  }'
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzdWFyaW8iOjIsIm5vbWJyZVVzdWFyaW8iOiJmaXNjYWxfanVhbiIsImVtYWlsIjoianVhbi5wZXJlekBtcC5nb3YiLCJwcmltZXJOb21icmUiOiJKdWFuIiwicHJpbWVyQXBlbGxpZG8iOiJQw6lyZXoiLCJyb2xlcyI6W10sInBlcm1pc3Npb25zIjpbXSwiaWF0IjoxNzQ4NTg0MzUwLCJleHAiOjE3NDg2NzA3NTB9.example_token_here",
    "usuario": {
      "idUsuario": 2,
      "nombreUsuario": "fiscal_juan",
      "email": "juan.perez@mp.gov",
      "primerNombre": "Juan",
      "primerApellido": "Pérez",
      "roles": ["fiscal"],
      "permissions": ["casos.leer", "casos.crear"]
    }
  }
}
```

### ❌ Respuesta de Error (401):
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "code": "AUTHENTICATION_ERROR"
}
```

---

## 🔄 3. REFRESCAR TOKEN
### `POST /api/auth/refresh`
**Acceso**: Público (requiere token válido o expirado)

### 📝 Ejemplo de Petición:
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.nuevo_token_aqui...",
    "usuario": {
      "idUsuario": 2,
      "nombreUsuario": "fiscal_juan",
      "email": "juan.perez@mp.gov",
      "primerNombre": "Juan",
      "primerApellido": "Pérez"
    }
  }
}
```

### ❌ Respuesta de Error (400):
```json
{
  "success": false,
  "message": "Token requerido para renovación"
}
```

---

## ✅ 4. VERIFICAR TOKEN
### `GET /api/auth/verify`
**Acceso**: Privado (requiere token)

### 📝 Ejemplo de Petición:
```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "idUsuario": 2,
    "nombreUsuario": "fiscal_juan",
    "roles": ["fiscal"],
    "permissions": ["casos.leer", "casos.crear"]
  }
}
```

### ❌ Respuesta de Error (401):
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "code": "AUTHENTICATION_ERROR"
}
```

---

## 👤 5. OBTENER PERFIL
### `GET /api/auth/profile`
**Acceso**: Privado (requiere token)

### 📝 Ejemplo de Petición:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "data": {
    "idUsuario": 2,
    "nombreUsuario": "fiscal_juan",
    "email": "juan.perez@mp.gov",
    "primerNombre": "Juan",
    "primerApellido": "Pérez",
    "roles": ["fiscal", "usuario"],
    "permissions": [
      "casos.leer",
      "casos.crear",
      "casos.actualizar",
      "reportes.generar"
    ]
  }
}
```

---

## 🔒 6. CAMBIAR CONTRASEÑA
### `POST /api/auth/change-password`
**Acceso**: Privado (requiere token)

### 📝 Ejemplo de Petición:
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "currentPassword": "MiPassword123",
    "newPassword": "NuevaPassword456"
  }'
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

### ❌ Respuesta de Error (400):
```json
{
  "success": false,
  "message": "La nueva contraseña debe tener al menos 6 caracteres"
}
```

### ❌ Respuesta de Error (401):
```json
{
  "success": false,
  "message": "Contraseña actual incorrecta",
  "code": "AUTHENTICATION_ERROR"
}
```

---

## 🚪 7. CERRAR SESIÓN (LOGOUT)
### `POST /api/auth/logout`
**Acceso**: Privado (requiere token)

### 📝 Ejemplo de Petición:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### ✅ Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

## 🧪 CASOS DE PRUEBA COMPLETOS

### 📋 Flujo Típico de Usuario:

#### 1. Registrar usuario:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user",
    "password": "TestPass123",
    "email": "test@mp.gov",
    "primerNombre": "Usuario",
    "primerApellido": "Prueba",
    "idFiscalia": 1
  }'
```

#### 2. Hacer login y guardar token:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user",
    "password": "TestPass123"
  }' | jq -r '.data.token')

echo "Token obtenido: $TOKEN"
```

#### 3. Verificar token:
```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer $TOKEN"
```

#### 4. Obtener perfil:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Cambiar contraseña:
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "TestPass123",
    "newPassword": "NewTestPass456"
  }'
```

#### 6. Cerrar sesión:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🛠️ EJEMPLOS PARA HERRAMIENTAS

### 📮 Postman Collection (JSON):
```json
{
  "info": {
    "name": "API Ministerio Público - Auth",
    "description": "Colección de endpoints de autenticación"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombreUsuario\": \"test_user\",\n  \"password\": \"TestPass123\",\n  \"email\": \"test@mp.gov\",\n  \"primerNombre\": \"Usuario\",\n  \"primerApellido\": \"Prueba\",\n  \"idFiscalia\": 1\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombreUsuario\": \"test_user\",\n  \"password\": \"TestPass123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "login"]
        }
      }
    }
  ]
}
```

### 🌙 Insomnia (HTTP File):
```http
### Register User
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nombreUsuario": "test_user",
  "password": "TestPass123",
  "email": "test@mp.gov",
  "primerNombre": "Usuario",
  "primerApellido": "Prueba",
  "idFiscalia": 1
}

### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "test_user",
  "password": "TestPass123"
}

### Get Profile
GET http://localhost:3001/api/auth/profile
Authorization: Bearer {{token}}
```

---

## 📚 NOTAS IMPORTANTES

1. **Tokens JWT**: Los tokens tienen una duración de 24 horas por defecto
2. **Headers requeridos**: Siempre incluir `Content-Type: application/json`
3. **Autenticación**: Los endpoints privados requieren `Authorization: Bearer <token>`
4. **Validaciones**: 
   - Contraseñas mínimo 6 caracteres
   - Nombres de usuario únicos
   - Emails válidos
5. **Manejo de errores**: Todos los endpoints devuelven errores estructurados con códigos específicos

---

## 🔍 ESTADOS HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Usuario registrado exitosamente
- **400**: Bad Request - Datos inválidos o faltantes
- **401**: Unauthorized - Credenciales inválidas o token expirado
- **403**: Forbidden - Sin permisos para la operación
- **500**: Internal Server Error - Error interno del servidor

---

## 🔧 Notas de Resolución de Problemas

### ✅ Problema Resuelto: Cambio de Contraseña
**Error anterior:** `Illegal arguments: string, undefined` en bcrypt.compare
**Causa:** El stored procedure `sp_Usuario_ObtenerPorId` no estaba devolviendo el campo `PasswordHash`
**Solución:** Se modificó el stored procedure para incluir `PasswordHash` en el SELECT:

```sql
ALTER PROCEDURE dbo.sp_Usuario_ObtenerPorId
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        IdUsuario, NombreUsuario, PasswordHash, Email, PrimerNombre, SegundoNombre,
        PrimerApellido, SegundoApellido, Activo, FechaCreacion, FechaUltimoLogin
    FROM dbo.Usuarios
    WHERE IdUsuario = @IdUsuario AND Activo = 1;
END;
```

### ✅ Flujo Completo de Cambio de Contraseña

1. **Hacer login para obtener token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "test_change_pwd", "password": "1234567"}'
```

2. **Cambiar contraseña usando el token:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN_AQUI]" \
  -d '{"currentPassword": "1234567", "newPassword": "nuevo_password"}'
```

3. **Verificar que funciona con la nueva contraseña:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "test_change_pwd", "password": "nuevo_password"}'
```

### ⚠️ Importante: Campo nombreUsuario vs username
El controlador de login espera el campo `nombreUsuario`, no `username`. Asegúrate de usar el campo correcto:

```json
// ✅ Correcto
{"nombreUsuario": "usuario", "password": "contraseña"}

// ❌ Incorrecto  
{"username": "usuario", "password": "contraseña"}
```
