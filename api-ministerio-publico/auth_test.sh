#!/bin/bash

# 🔐 Script de Pruebas para Auth Controller - API Ministerio Público
# Ejecutar: chmod +x auth_test.sh && ./auth_test.sh

BASE_URL="http://localhost:3001"
echo "🚀 Iniciando pruebas de Auth Controller..."
echo "📍 URL Base: $BASE_URL"
echo "==========================================\n"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar headers de sección
print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}==========================================${NC}"
}

# Función para mostrar resultados
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}\n"
    else
        echo -e "${RED}❌ $2${NC}\n"
    fi
}

# 1. Health Check
print_header "HEALTH CHECK"
echo "GET $BASE_URL/health"
curl -s -X GET "$BASE_URL/health" | jq '.' || echo "❌ Error en health check"
echo ""

# 2. Registro de Usuario
print_header "REGISTRO DE USUARIO"
echo "POST $BASE_URL/api/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user_script",
    "password": "TestPassword123",
    "email": "test.script@mp.gov",
    "primerNombre": "Usuario",
    "segundoNombre": "De",
    "primerApellido": "Prueba",
    "segundoApellido": "Script",
    "idFiscalia": 1
  }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# 3. Login
print_header "LOGIN"
echo "POST $BASE_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user_script",
    "password": "TestPassword123"
  }')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extraer token si existe
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo -e "${GREEN}🔑 Token obtenido exitosamente${NC}"
    export AUTH_TOKEN="$TOKEN"
else
    echo -e "${RED}❌ No se pudo obtener el token${NC}"
    AUTH_TOKEN=""
fi
echo ""

# Solo continuar si tenemos token
if [ "$AUTH_TOKEN" != "" ]; then

    # 4. Verificar Token
    print_header "VERIFICAR TOKEN"
    echo "GET $BASE_URL/api/auth/verify"
    VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/verify" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
    echo ""

    # 5. Obtener Perfil
    print_header "OBTENER PERFIL"
    echo "GET $BASE_URL/api/auth/profile"
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
    echo ""

    # 6. Cambiar Contraseña
    print_header "CAMBIAR CONTRASEÑA"
    echo "POST $BASE_URL/api/auth/change-password"
    CHANGE_PWD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/change-password" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d '{
        "currentPassword": "TestPassword123",
        "newPassword": "NewTestPassword456"
      }')
    
    echo "$CHANGE_PWD_RESPONSE" | jq '.' 2>/dev/null || echo "$CHANGE_PWD_RESPONSE"
    echo ""

    # 7. Refrescar Token
    print_header "REFRESCAR TOKEN"
    echo "POST $BASE_URL/api/auth/refresh"
    REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$REFRESH_RESPONSE" | jq '.' 2>/dev/null || echo "$REFRESH_RESPONSE"
    echo ""

    # 8. Logout
    print_header "LOGOUT"
    echo "POST $BASE_URL/api/auth/logout"
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN")
    
    echo "$LOGOUT_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGOUT_RESPONSE"
    echo ""

else
    echo -e "${YELLOW}⚠️  Saltando pruebas que requieren autenticación (no hay token)${NC}"
fi

# Pruebas de Error
print_header "PRUEBAS DE ERROR"

echo -e "${YELLOW}🧪 Login con credenciales incorrectas:${NC}"
ERROR_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "usuario_inexistente",
    "password": "password_incorrecto"
  }')
echo "$ERROR_LOGIN" | jq '.' 2>/dev/null || echo "$ERROR_LOGIN"
echo ""

echo -e "${YELLOW}🧪 Acceso sin token:${NC}"
NO_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Content-Type: application/json")
echo "$NO_TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$NO_TOKEN_RESPONSE"
echo ""

echo -e "${YELLOW}🧪 Token inválido:${NC}"
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_invalido_123")
echo "$INVALID_TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$INVALID_TOKEN_RESPONSE"
echo ""

print_header "RESUMEN"
echo -e "${GREEN}✅ Pruebas completadas${NC}"
echo -e "${BLUE}📝 Revisa los resultados arriba para verificar el funcionamiento${NC}"
echo -e "${BLUE}🔧 Si hay errores de stored procedures, verifica la configuración de la base de datos${NC}"
echo "==========================================\n"

# --- Nuevas Pruebas Agregadas ---

# 5. Cambio de Contraseña
print_header "CAMBIO DE CONTRASEÑA"
echo "POST $BASE_URL/api/auth/change-password"
CHANGE_PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "currentPassword": "TestPassword123",
    "newPassword": "NewTestPassword456"
  }')

echo "Response:"
echo "$CHANGE_PASSWORD_RESPONSE" | jq '.'

# Validar respuesta de cambio de contraseña
CHANGE_SUCCESS=$(echo "$CHANGE_PASSWORD_RESPONSE" | jq -r '.success')
if [ "$CHANGE_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Cambio de contraseña exitoso${NC}\n"
else
    echo -e "${YELLOW}⚠️ Cambio de contraseña falló (puede ser que ya se cambió antes)${NC}\n"
fi

# 6. Verificar Login con Nueva Contraseña
print_header "VERIFICAR LOGIN CON NUEVA CONTRASEÑA"
echo "POST $BASE_URL/api/auth/login"
NEW_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user_script",
    "password": "NewTestPassword456"
  }')

echo "Response:"
echo "$NEW_LOGIN_RESPONSE" | jq '.'

# Validar respuesta de login con nueva contraseña
NEW_SUCCESS=$(echo "$NEW_LOGIN_RESPONSE" | jq -r '.success')
if [ "$NEW_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Login con nueva contraseña exitoso${NC}\n"
else
    echo -e "${RED}❌ ERROR: Login con nueva contraseña falló${NC}\n"
fi

# Extraer nuevo token
NEW_TOKEN=$(echo "$NEW_LOGIN_RESPONSE" | jq -r '.data.token')
echo "✅ Nuevo token extraído: ${NEW_TOKEN:0:20}..."

# 7. Verificar que la Contraseña Anterior ya NO Funciona
print_header "VERIFICAR QUE CONTRASEÑA ANTERIOR NO FUNCIONA"
echo "POST $BASE_URL/api/auth/login"
OLD_PASSWORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "test_user_script",
    "password": "TestPassword123"
  }')

echo "Response:"
echo "$OLD_PASSWORD_RESPONSE" | jq '.'

# Para este caso, esperamos que falle
OLD_SUCCESS=$(echo "$OLD_PASSWORD_RESPONSE" | jq -r '.success')
if [ "$OLD_SUCCESS" = "false" ]; then
    echo -e "${GREEN}✅ Contraseña anterior correctamente invalidada${NC}\n"
else
    echo -e "${RED}❌ ERROR: La contraseña anterior aún funciona${NC}\n"
fi

print_header "RESUMEN FINAL"
echo -e "${GREEN}✅ Todas las pruebas completadas${NC}"
echo "==========================================\n"
