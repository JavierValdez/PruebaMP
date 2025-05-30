# 🚀 EJEMPLOS RÁPIDOS - Auth Controller

## ⚡ Copiar y Pegar Directo

### 1. 🏥 Health Check
```bash
curl -X GET http://localhost:3001/health
```

### 2. 📝 Registrar Usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "mi_usuario",
    "password": "MiPassword123",
    "email": "usuario@mp.gov",
    "primerNombre": "Mi",
    "primerApellido": "Usuario",
    "idFiscalia": 1
  }'
```

### 3. 🔐 Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "mi_usuario",
    "password": "MiPassword123"
  }'
```

### 4. 👤 Ver Perfil (reemplaza TOKEN)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 5. ✅ Verificar Token
```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 6. 🔄 Refrescar Token
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### 7. 🔒 Cambiar Contraseña
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "currentPassword": "MiPassword123",
    "newPassword": "NuevaPassword456"
  }'
```

### 8. 🚪 Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

---

## 🧪 FLUJO COMPLETO EN UNA SOLA LÍNEA

### Obtener token y guardarlo en variable:
```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"nombreUsuario": "mi_usuario", "password": "MiPassword123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
```

### Usar el token:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 Para VS Code REST Client

Crea un archivo `.http` y copia esto:

```http
### Health Check
GET http://localhost:3001/health

### Register
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nombreUsuario": "test_vscode",
  "password": "VscodeTest123",
  "email": "vscode@mp.gov",
  "primerNombre": "VS",
  "primerApellido": "Code",
  "idFiscalia": 1
}

### Login
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "nombreUsuario": "test_vscode",
  "password": "VscodeTest123"
}

### Profile (replace with actual token)
GET http://localhost:3001/api/auth/profile
Authorization: Bearer your_token_here

### Verify Token
GET http://localhost:3001/api/auth/verify
Authorization: Bearer your_token_here

### Change Password
POST http://localhost:3001/api/auth/change-password
Content-Type: application/json
Authorization: Bearer your_token_here

{
  "currentPassword": "VscodeTest123",
  "newPassword": "NewVscodeTest456"
}

### Logout
POST http://localhost:3001/api/auth/logout
Authorization: Bearer your_token_here
```

---

## 📱 Para Postman (Importar JSON)

```json
{
  "info": {
    "name": "Auth API Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombreUsuario\": \"postman_user\",\n  \"password\": \"PostmanTest123\",\n  \"email\": \"postman@mp.gov\",\n  \"primerNombre\": \"Postman\",\n  \"primerApellido\": \"User\",\n  \"idFiscalia\": 1\n}"
        },
        "url": "{{baseUrl}}/api/auth/register"
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombreUsuario\": \"postman_user\",\n  \"password\": \"PostmanTest123\"\n}"
        },
        "url": "{{baseUrl}}/api/auth/login"
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:3001"}
  ]
}
```

---

## ⚠️ ERRORES COMUNES

### Error de stored procedure:
```json
{
  "success": false,
  "message": "Could not find stored procedure 'sp_Usuario_ObtenerPorNombreUsuario'"
}
```
**Solución**: Verificar configuración de base de datos

### Token expirado:
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```
**Solución**: Hacer login nuevamente

### Sin autorización:
```json
{
  "success": false,
  "message": "Token de autorización requerido"
}
```
**Solución**: Incluir header `Authorization: Bearer tu_token`
