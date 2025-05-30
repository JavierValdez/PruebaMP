#!/bin/bash

# 🗂️ Script de Pruebas para Gestión de Casos - API Ministerio Público
# Ejecutar: chmod +x caso_test.sh && ./caso_test.sh

BASE_URL="http://localhost:3001"
echo "🚀 Iniciando pruebas de gestión de casos..."
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

# 2. Login Admin
print_header "LOGIN ADMIN"
echo "POST $BASE_URL/api/auth/login"
ADMIN_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "admin",
    "password": "password"
  }')
echo "$ADMIN_LOGIN" | jq '.'
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | jq -r '.data.token')
echo "Token Admin: $ADMIN_TOKEN"
echo ""

# 3. Login Fiscal1
print_header "LOGIN FISCAL1"
echo "POST $BASE_URL/api/auth/login"
FISCAL1_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal1",
    "password": "password"
  }')
echo "$FISCAL1_LOGIN" | jq '.'
FISCAL1_TOKEN=$(echo "$FISCAL1_LOGIN" | jq -r '.data.token')
echo "Token Fiscal1: $FISCAL1_TOKEN"
echo ""

# 4. Login Fiscal2
print_header "LOGIN FISCAL2"
echo "POST $BASE_URL/api/auth/login"
FISCAL2_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal2",
    "password": "password"
  }')
echo "$FISCAL2_LOGIN" | jq '.'
FISCAL2_TOKEN=$(echo "$FISCAL2_LOGIN" | jq -r '.data.token')
echo "Token Fiscal2: $FISCAL2_TOKEN"
echo ""

# 5. Listar Casos - Admin
print_header "LISTAR CASOS - ADMIN"
echo "GET $BASE_URL/api/casos"
curl -s -X GET "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# 6. Listar Casos - Fiscal1
print_header "LISTAR CASOS - FISCAL1"
echo "GET $BASE_URL/api/casos"
curl -s -X GET "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN" | jq '.'
echo ""

# 7. Mis Casos - Fiscal1
print_header "MIS CASOS - FISCAL1"
echo "GET $BASE_URL/api/casos/mis-casos"
curl -s -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN" | jq '.'
echo ""

# 8. Mis Casos - Fiscal2
print_header "MIS CASOS - FISCAL2"
echo "GET $BASE_URL/api/casos/mis-casos"
curl -s -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL2_TOKEN" | jq '.'
echo ""

# 9. Crear Caso - Admin
print_header "CREAR CASO - ADMIN"
echo "POST $BASE_URL/api/casos"
NUEVO_CASO=$(curl -s -X POST "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numeroCasoUnico": "EXP-TEST-'$(date +%Y%m%d%H%M%S)'",
    "descripcion": "Caso creado mediante script de pruebas automatizadas",
    "idEstadoCaso": 1
  }')
echo "$NUEVO_CASO" | jq '.'
CASO_ID=$(echo "$NUEVO_CASO" | jq -r '.data.idCaso')
echo "ID del nuevo caso: $CASO_ID"
echo ""

# 10. Asignar Caso - Admin a Fiscal1
if [ "$CASO_ID" != "null" ] && [ -n "$CASO_ID" ]; then
    print_header "ASIGNAR CASO - ADMIN a FISCAL1"
    echo "PUT $BASE_URL/api/casos/$CASO_ID/asignar"
    curl -s -X PUT "$BASE_URL/api/casos/$CASO_ID/asignar" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"fiscalId": 2}' | jq '.'
    echo ""
fi

# 11. Verificar Asignación - Mis Casos Fiscal1
print_header "VERIFICAR ASIGNACIÓN - MIS CASOS FISCAL1"
echo "GET $BASE_URL/api/casos/mis-casos"
curl -s -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN" | jq '.'
echo ""

# 12. Estadísticas - Admin
print_header "ESTADÍSTICAS - ADMIN"
echo "GET $BASE_URL/api/casos/estadisticas"
curl -s -X GET "$BASE_URL/api/casos/estadisticas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# 13. Prueba de Autorización - Fiscal intenta crear caso (debe fallar)
print_header "PRUEBA AUTORIZACIÓN - FISCAL CREA CASO (DEBE FALLAR)"
echo "POST $BASE_URL/api/casos"
curl -s -X POST "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "numeroCasoUnico": "EXP-NO-PERMITIDO",
    "descripcion": "Este caso no debería crearse",
    "idEstadoCaso": 1
  }' | jq '.'
echo ""

# 14. Prueba sin Token (debe fallar)
print_header "PRUEBA SIN TOKEN (DEBE FALLAR)"
echo "GET $BASE_URL/api/casos"
curl -s -X GET "$BASE_URL/api/casos" | jq '.'
echo ""

echo "🏁 Pruebas completadas"
