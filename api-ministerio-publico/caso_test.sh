#!/bin/bash

# 🗂️ Script de Pruebas Completo para Gestión de Casos - API Ministerio Público
# Ejecutar: chmod +x caso_test.sh && ./caso_test.sh

BASE_URL="http://localhost:3001"
echo "🚀 Iniciando pruebas exhaustivas de gestión de casos..."
echo "📍 URL Base: $BASE_URL"
echo "📝 Este script probará todos los métodos del CasoController"
echo "==========================================\n"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Variables para registrar resultados
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
TEST_LOG=""

# Función para mostrar headers de sección
print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}==========================================${NC}"
}

# Función para mostrar sub-headers
print_subheader() {
    echo -e "${CYAN}------------------------------------------${NC}"
    echo -e "${CYAN}📋 $1${NC}"
    echo -e "${CYAN}------------------------------------------${NC}"
}

# Función para mostrar la petición
print_request() {
    echo -e "${YELLOW}📤 PETICIÓN:${NC}"
    echo -e "${YELLOW}$1${NC}"
}

# Función para mostrar la respuesta
print_response() {
    echo -e "${PURPLE}📥 RESPUESTA:${NC}"
    echo "$1" | jq '.' 2>/dev/null || echo "$1"
}

# Función para registrar resultado de test
log_test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
        echo -e "${GREEN}✅ $2${NC}"
        TEST_LOG="$TEST_LOG\n✅ $2"
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo -e "${RED}❌ $2${NC}"
        TEST_LOG="$TEST_LOG\n❌ $2"
    fi
    echo ""
}

# Función para mostrar estadísticas finales
print_final_stats() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}📊 RESUMEN FINAL DE PRUEBAS${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo -e "Total de pruebas: ${TOTAL_TESTS}"
    echo -e "${GREEN}Exitosas: ${PASSED_TESTS}${NC}"
    echo -e "${RED}Fallidas: ${FAILED_TESTS}${NC}"
    echo -e "Porcentaje de éxito: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
    echo -e "\n${YELLOW}Registro detallado:${NC}"
    echo -e "$TEST_LOG"
}

# ==========================================
# 🏥 HEALTH CHECK Y AUTENTICACIÓN
# ==========================================

print_header "FASE 1: HEALTH CHECK Y AUTENTICACIÓN"

# 1. Health Check
print_subheader "1. Health Check del Servidor"
print_request "GET $BASE_URL/health"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/health")
HTTP_CODE="${HEALTH_RESPONSE: -3}"
HEALTH_BODY="${HEALTH_RESPONSE%???}"
print_response "$HEALTH_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Health Check - Servidor funcionando correctamente"
else
    log_test_result 1 "Health Check - Error en servidor (HTTP $HTTP_CODE)"
fi

# 2. Login Admin
print_subheader "2. Autenticación como Administrador"
print_request "POST $BASE_URL/api/auth/login
Body: {
  \"nombreUsuario\": \"admin\",
  \"password\": \"password\"
}"
ADMIN_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "admin",
    "password": "password"
  }')
HTTP_CODE="${ADMIN_LOGIN_RESPONSE: -3}"
ADMIN_LOGIN_BODY="${ADMIN_LOGIN_RESPONSE%???}"
print_response "$ADMIN_LOGIN_BODY"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_BODY" | jq -r '.data.token // empty')
if [ "$HTTP_CODE" = "200" ] && [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    log_test_result 0 "Login Admin - Autenticación exitosa"
    echo "🔑 Token Admin obtenido: ${ADMIN_TOKEN:0:20}..."
else
    log_test_result 1 "Login Admin - Error en autenticación (HTTP $HTTP_CODE)"
fi

# 3. Login Fiscal1
print_subheader "3. Autenticación como Fiscal 1"
print_request "POST $BASE_URL/api/auth/login
Body: {
  \"nombreUsuario\": \"fiscal1\",
  \"password\": \"password\"
}"
FISCAL1_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal1",
    "password": "password"
  }')
HTTP_CODE="${FISCAL1_LOGIN_RESPONSE: -3}"
FISCAL1_LOGIN_BODY="${FISCAL1_LOGIN_RESPONSE%???}"
print_response "$FISCAL1_LOGIN_BODY"
FISCAL1_TOKEN=$(echo "$FISCAL1_LOGIN_BODY" | jq -r '.data.token // empty')
if [ "$HTTP_CODE" = "200" ] && [ -n "$FISCAL1_TOKEN" ] && [ "$FISCAL1_TOKEN" != "null" ]; then
    log_test_result 0 "Login Fiscal1 - Autenticación exitosa"
    echo "🔑 Token Fiscal1 obtenido: ${FISCAL1_TOKEN:0:20}..."
else
    log_test_result 1 "Login Fiscal1 - Error en autenticación (HTTP $HTTP_CODE)"
fi

# 4. Login Fiscal2
print_subheader "4. Autenticación como Fiscal 2"
print_request "POST $BASE_URL/api/auth/login
Body: {
  \"nombreUsuario\": \"fiscal2\",
  \"password\": \"password\"
}"
FISCAL2_LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "fiscal2",
    "password": "password"
  }')
HTTP_CODE="${FISCAL2_LOGIN_RESPONSE: -3}"
FISCAL2_LOGIN_BODY="${FISCAL2_LOGIN_RESPONSE%???}"
print_response "$FISCAL2_LOGIN_BODY"
FISCAL2_TOKEN=$(echo "$FISCAL2_LOGIN_BODY" | jq -r '.data.token // empty')
if [ "$HTTP_CODE" = "200" ] && [ -n "$FISCAL2_TOKEN" ] && [ "$FISCAL2_TOKEN" != "null" ]; then
    log_test_result 0 "Login Fiscal2 - Autenticación exitosa"
    echo "🔑 Token Fiscal2 obtenido: ${FISCAL2_TOKEN:0:20}..."
else
    log_test_result 1 "Login Fiscal2 - Error en autenticación (HTTP $HTTP_CODE)"
fi

# ==========================================
# 📊 ENDPOINTS DE CONSULTA (SOLO LECTURA)
# ==========================================

print_header "FASE 2: ENDPOINTS DE CONSULTA Y DATOS MAESTROS"

# 5. Obtener Estados de Caso
print_subheader "5. Obtener Estados de Caso"
print_request "GET $BASE_URL/api/casos/estados
Headers: Authorization: Bearer [ADMIN_TOKEN]"
ESTADOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/estados" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${ESTADOS_RESPONSE: -3}"
ESTADOS_BODY="${ESTADOS_RESPONSE%???}"
print_response "$ESTADOS_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Obtener Estados - Lista obtenida correctamente"
    # Extraer primer estado para usar en pruebas posteriores
    PRIMER_ESTADO=$(echo "$ESTADOS_BODY" | jq -r '.data[0].idEstadoCaso // 1')
    echo "📝 Estado para pruebas: $PRIMER_ESTADO"
else
    log_test_result 1 "Obtener Estados - Error al obtener lista (HTTP $HTTP_CODE)"
    PRIMER_ESTADO=1
fi

# 6. Obtener Fiscales Activos
print_subheader "6. Obtener Fiscales Activos"
print_request "GET $BASE_URL/api/casos/fiscales
Headers: Authorization: Bearer [ADMIN_TOKEN]"
FISCALES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/fiscales" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${FISCALES_RESPONSE: -3}"
FISCALES_BODY="${FISCALES_RESPONSE%???}"
print_response "$FISCALES_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Obtener Fiscales - Lista obtenida correctamente"
    # Extraer primer fiscal para usar en pruebas posteriores
    PRIMER_FISCAL=$(echo "$FISCALES_BODY" | jq -r '.data[0].idUsuario // 2')
    echo "📝 Fiscal para pruebas: $PRIMER_FISCAL"
else
    log_test_result 1 "Obtener Fiscales - Error al obtener lista (HTTP $HTTP_CODE)"
    PRIMER_FISCAL=2
fi

# 7. Listar Casos (Admin) - Sin filtros
print_subheader "7. Listar Casos como Admin (Sin filtros)"
print_request "GET $BASE_URL/api/casos
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_LIST_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_LIST_RESPONSE: -3}"
CASOS_LIST_BODY="${CASOS_LIST_RESPONSE%???}"
print_response "$CASOS_LIST_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Listar Casos Admin - Lista obtenida correctamente"
else
    log_test_result 1 "Listar Casos Admin - Error al obtener lista (HTTP $HTTP_CODE)"
fi

# 8. Listar Casos (Admin) - Con paginación
print_subheader "8. Listar Casos como Admin (Con paginación)"
print_request "GET $BASE_URL/api/casos?pagina=1&resultadosPorPagina=5
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_PAGINADOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos?pagina=1&resultadosPorPagina=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_PAGINADOS_RESPONSE: -3}"
CASOS_PAGINADOS_BODY="${CASOS_PAGINADOS_RESPONSE%???}"
print_response "$CASOS_PAGINADOS_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Listar Casos Paginados - Paginación funcionando correctamente"
else
    log_test_result 1 "Listar Casos Paginados - Error en paginación (HTTP $HTTP_CODE)"
fi

# 9. Listar Casos (Admin) - Con filtros
print_subheader "9. Listar Casos como Admin (Con filtros)"
print_request "GET $BASE_URL/api/casos?idEstadoCaso=$PRIMER_ESTADO&pagina=1
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_FILTRADOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos?idEstadoCaso=$PRIMER_ESTADO&pagina=1" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_FILTRADOS_RESPONSE: -3}"
CASOS_FILTRADOS_BODY="${CASOS_FILTRADOS_RESPONSE%???}"
print_response "$CASOS_FILTRADOS_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Listar Casos Filtrados - Filtros funcionando correctamente"
else
    log_test_result 1 "Listar Casos Filtrados - Error en filtros (HTTP $HTTP_CODE)"
fi

# 10. Listar Casos como Fiscal1
print_subheader "10. Listar Casos como Fiscal1"
print_request "GET $BASE_URL/api/casos
Headers: Authorization: Bearer [FISCAL1_TOKEN]"
CASOS_FISCAL1_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN")
HTTP_CODE="${CASOS_FISCAL1_RESPONSE: -3}"
CASOS_FISCAL1_BODY="${CASOS_FISCAL1_RESPONSE%???}"
print_response "$CASOS_FISCAL1_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Listar Casos Fiscal1 - Acceso correcto según permisos"
else
    log_test_result 1 "Listar Casos Fiscal1 - Error de acceso (HTTP $HTTP_CODE)"
fi
# ==========================================
# 🔍 ENDPOINTS DE BÚSQUEDA Y CONSULTAS ESPECÍFICAS
# ==========================================

print_header "FASE 3: ENDPOINTS DE BÚSQUEDA Y CONSULTAS ESPECÍFICAS"

# 11. Mis Casos - Fiscal1
print_subheader "11. Mis Casos asignados (Fiscal1)"
print_request "GET $BASE_URL/api/casos/mis-casos
Headers: Authorization: Bearer [FISCAL1_TOKEN]"
MIS_CASOS_F1_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN")
HTTP_CODE="${MIS_CASOS_F1_RESPONSE: -3}"
MIS_CASOS_F1_BODY="${MIS_CASOS_F1_RESPONSE%???}"
print_response "$MIS_CASOS_F1_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Mis Casos Fiscal1 - Lista obtenida correctamente"
else
    log_test_result 1 "Mis Casos Fiscal1 - Error al obtener casos asignados (HTTP $HTTP_CODE)"
fi

# 12. Mis Casos - Fiscal2
print_subheader "12. Mis Casos asignados (Fiscal2)"
print_request "GET $BASE_URL/api/casos/mis-casos
Headers: Authorization: Bearer [FISCAL2_TOKEN]"
MIS_CASOS_F2_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL2_TOKEN")
HTTP_CODE="${MIS_CASOS_F2_RESPONSE: -3}"
MIS_CASOS_F2_BODY="${MIS_CASOS_F2_RESPONSE%???}"
print_response "$MIS_CASOS_F2_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Mis Casos Fiscal2 - Lista obtenida correctamente"
else
    log_test_result 1 "Mis Casos Fiscal2 - Error al obtener casos asignados (HTTP $HTTP_CODE)"
fi

# 13. Buscar Casos con término
print_subheader "13. Buscar Casos con término de búsqueda"
print_request "GET $BASE_URL/api/casos/buscar?termino=caso&pagina=1&resultadosPorPagina=5
Headers: Authorization: Bearer [ADMIN_TOKEN]"
BUSCAR_CASOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/buscar?termino=caso&pagina=1&resultadosPorPagina=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${BUSCAR_CASOS_RESPONSE: -3}"
BUSCAR_CASOS_BODY="${BUSCAR_CASOS_RESPONSE%???}"
print_response "$BUSCAR_CASOS_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Buscar Casos - Búsqueda funcionando correctamente"
else
    log_test_result 1 "Buscar Casos - Error en búsqueda (HTTP $HTTP_CODE)"
fi

# 14. Buscar Casos sin término (debe fallar)
print_subheader "14. Buscar Casos sin término (Validación de error)"
print_request "GET $BASE_URL/api/casos/buscar
Headers: Authorization: Bearer [ADMIN_TOKEN]"
BUSCAR_SIN_TERMINO_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/buscar" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${BUSCAR_SIN_TERMINO_RESPONSE: -3}"
BUSCAR_SIN_TERMINO_BODY="${BUSCAR_SIN_TERMINO_RESPONSE%???}"
print_response "$BUSCAR_SIN_TERMINO_BODY"
if [ "$HTTP_CODE" = "400" ]; then
    log_test_result 0 "Buscar Sin Término - Validación de error funcionando correctamente"
else
    log_test_result 1 "Buscar Sin Término - Validación de error no funcionando (HTTP $HTTP_CODE)"
fi

# 15. Obtener Casos por Fiscal
print_subheader "15. Obtener Casos por Fiscal específico"
print_request "GET $BASE_URL/api/casos/fiscal/$PRIMER_FISCAL?pagina=1&resultadosPorPagina=5
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_POR_FISCAL_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/fiscal/$PRIMER_FISCAL?pagina=1&resultadosPorPagina=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_POR_FISCAL_RESPONSE: -3}"
CASOS_POR_FISCAL_BODY="${CASOS_POR_FISCAL_RESPONSE%???}"
print_response "$CASOS_POR_FISCAL_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Casos por Fiscal - Consulta funcionando correctamente"
else
    log_test_result 1 "Casos por Fiscal - Error en consulta (HTTP $HTTP_CODE)"
fi

# 16. Obtener Casos por Fiscal con ID inválido
print_subheader "16. Obtener Casos por Fiscal con ID inválido"
print_request "GET $BASE_URL/api/casos/fiscal/invalid
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_FISCAL_INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/fiscal/invalid" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_FISCAL_INVALID_RESPONSE: -3}"
CASOS_FISCAL_INVALID_BODY="${CASOS_FISCAL_INVALID_RESPONSE%???}"
print_response "$CASOS_FISCAL_INVALID_BODY"
if [ "$HTTP_CODE" = "400" ]; then
    log_test_result 0 "Casos por Fiscal Inválido - Validación funcionando correctamente"
else
    log_test_result 1 "Casos por Fiscal Inválido - Validación no funcionando (HTTP $HTTP_CODE)"
fi

# 17. Obtener Casos por Estado
print_subheader "17. Obtener Casos por Estado específico"
print_request "GET $BASE_URL/api/casos/estado/$PRIMER_ESTADO?pagina=1&resultadosPorPagina=5
Headers: Authorization: Bearer [ADMIN_TOKEN]"
CASOS_POR_ESTADO_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/estado/$PRIMER_ESTADO?pagina=1&resultadosPorPagina=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${CASOS_POR_ESTADO_RESPONSE: -3}"
CASOS_POR_ESTADO_BODY="${CASOS_POR_ESTADO_RESPONSE%???}"
print_response "$CASOS_POR_ESTADO_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Casos por Estado - Consulta funcionando correctamente"
else
    log_test_result 1 "Casos por Estado - Error en consulta (HTTP $HTTP_CODE)"
fi

# 18. Obtener Estadísticas
print_subheader "18. Obtener Estadísticas de Casos"
print_request "GET $BASE_URL/api/casos/estadisticas
Headers: Authorization: Bearer [ADMIN_TOKEN]"
ESTADISTICAS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/estadisticas" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${ESTADISTICAS_RESPONSE: -3}"
ESTADISTICAS_BODY="${ESTADISTICAS_RESPONSE%???}"
print_response "$ESTADISTICAS_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Estadísticas - Reporte obtenido correctamente"
else
    log_test_result 1 "Estadísticas - Error al obtener reporte (HTTP $HTTP_CODE)"
fi

# ==========================================
# ✏️ ENDPOINTS DE CREACIÓN Y MODIFICACIÓN
# ==========================================

print_header "FASE 4: ENDPOINTS DE CREACIÓN Y MODIFICACIÓN"

# 19. Crear Nuevo Caso (Admin)
print_subheader "19. Crear Nuevo Caso como Admin"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
NUMERO_CASO="EXP-TEST-$TIMESTAMP"
print_request "POST $BASE_URL/api/casos
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"numeroCasoUnico\": \"$NUMERO_CASO\",
  \"descripcion\": \"Caso creado mediante script de pruebas automatizadas\",
  \"idEstadoCaso\": $PRIMER_ESTADO
}"
CREAR_CASO_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"numeroCasoUnico\": \"$NUMERO_CASO\",
    \"descripcion\": \"Caso creado mediante script de pruebas automatizadas\",
    \"idEstadoCaso\": $PRIMER_ESTADO
  }")
HTTP_CODE="${CREAR_CASO_RESPONSE: -3}"
CREAR_CASO_BODY="${CREAR_CASO_RESPONSE%???}"
print_response "$CREAR_CASO_BODY"
CASO_ID=$(echo "$CREAR_CASO_BODY" | jq -r '.data.idCaso // empty')
if [ "$HTTP_CODE" = "201" ] && [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    log_test_result 0 "Crear Caso Admin - Caso creado exitosamente (ID: $CASO_ID)"
    echo "📝 ID del caso creado: $CASO_ID"
else
    log_test_result 1 "Crear Caso Admin - Error al crear caso (HTTP $HTTP_CODE)"
    CASO_ID=""
fi

# 20. Crear Caso con datos faltantes (debe fallar)
print_subheader "20. Crear Caso con datos faltantes (Validación)"
print_request "POST $BASE_URL/api/casos
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"descripcion\": \"Caso incompleto\"
}"
CREAR_CASO_INCOMPLETO_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Caso incompleto"
  }')
HTTP_CODE="${CREAR_CASO_INCOMPLETO_RESPONSE: -3}"
CREAR_CASO_INCOMPLETO_BODY="${CREAR_CASO_INCOMPLETO_RESPONSE%???}"
print_response "$CREAR_CASO_INCOMPLETO_BODY"
if [ "$HTTP_CODE" = "400" ]; then
    log_test_result 0 "Crear Caso Incompleto - Validación funcionando correctamente"
else
    log_test_result 1 "Crear Caso Incompleto - Validación no funcionando (HTTP $HTTP_CODE)"
fi

# 21. Intentar crear caso como Fiscal (debe fallar por permisos)
print_subheader "21. Intentar crear caso como Fiscal (Sin permisos)"
print_request "POST $BASE_URL/api/casos
Headers: Authorization: Bearer [FISCAL1_TOKEN]
Body: {
  \"numeroCasoUnico\": \"EXP-NO-PERMITIDO\",
  \"descripcion\": \"Este caso no debería crearse\",
  \"idEstadoCaso\": $PRIMER_ESTADO
}"
CREAR_CASO_FISCAL_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"numeroCasoUnico\": \"EXP-NO-PERMITIDO\",
    \"descripcion\": \"Este caso no debería crearse\",
    \"idEstadoCaso\": $PRIMER_ESTADO
  }")
HTTP_CODE="${CREAR_CASO_FISCAL_RESPONSE: -3}"
CREAR_CASO_FISCAL_BODY="${CREAR_CASO_FISCAL_RESPONSE%???}"
print_response "$CREAR_CASO_FISCAL_BODY"
if [ "$HTTP_CODE" = "403" ]; then
    log_test_result 0 "Crear Caso Fiscal - Control de permisos funcionando correctamente"
else
    log_test_result 1 "Crear Caso Fiscal - Control de permisos no funcionando (HTTP $HTTP_CODE)"
fi

# ==========================================
# 📄 ENDPOINTS DE CONSULTA INDIVIDUAL Y ACTUALIZACIÓN
# ==========================================

print_header "FASE 5: CONSULTA INDIVIDUAL Y ACTUALIZACIÓN"

# 22. Obtener Caso por ID (si se creó uno)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "22. Obtener Caso por ID específico"
    print_request "GET $BASE_URL/api/casos/$CASO_ID
Headers: Authorization: Bearer [ADMIN_TOKEN]"
    OBTENER_CASO_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/$CASO_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_CODE="${OBTENER_CASO_RESPONSE: -3}"
    OBTENER_CASO_BODY="${OBTENER_CASO_RESPONSE%???}"
    print_response "$OBTENER_CASO_BODY"
    if [ "$HTTP_CODE" = "200" ]; then
        log_test_result 0 "Obtener Caso por ID - Caso obtenido correctamente"
    else
        log_test_result 1 "Obtener Caso por ID - Error al obtener caso (HTTP $HTTP_CODE)"
    fi
else
    log_test_result 1 "Obtener Caso por ID - No hay caso para probar (caso no creado previamente)"
fi

# 23. Obtener Caso con ID inválido
print_subheader "23. Obtener Caso con ID inválido"
print_request "GET $BASE_URL/api/casos/invalid
Headers: Authorization: Bearer [ADMIN_TOKEN]"
OBTENER_CASO_INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/invalid" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${OBTENER_CASO_INVALID_RESPONSE: -3}"
OBTENER_CASO_INVALID_BODY="${OBTENER_CASO_INVALID_RESPONSE%???}"
print_response "$OBTENER_CASO_INVALID_BODY"
if [ "$HTTP_CODE" = "400" ]; then
    log_test_result 0 "Obtener Caso ID Inválido - Validación funcionando correctamente"
else
    log_test_result 1 "Obtener Caso ID Inválido - Validación no funcionando (HTTP $HTTP_CODE)"
fi

# 24. Actualizar Caso (si se creó uno)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "24. Actualizar Caso existente"
    print_request "PUT $BASE_URL/api/casos/$CASO_ID
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"descripcion\": \"Caso actualizado mediante script de pruebas\",
  \"detalleProgreso\": \"Progreso actualizado en pruebas automatizadas\"
}"
    ACTUALIZAR_CASO_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/api/casos/$CASO_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "descripcion": "Caso actualizado mediante script de pruebas",
        "detalleProgreso": "Progreso actualizado en pruebas automatizadas"
      }')
    HTTP_CODE="${ACTUALIZAR_CASO_RESPONSE: -3}"
    ACTUALIZAR_CASO_BODY="${ACTUALIZAR_CASO_RESPONSE%???}"
    print_response "$ACTUALIZAR_CASO_BODY"
    if [ "$HTTP_CODE" = "200" ]; then
        log_test_result 0 "Actualizar Caso - Caso actualizado correctamente"
    else
        log_test_result 1 "Actualizar Caso - Error al actualizar caso (HTTP $HTTP_CODE)"
    fi
else
    log_test_result 1 "Actualizar Caso - No hay caso para probar (caso no creado previamente)"
fi

# 25. Actualizar Caso con ID inválido
print_subheader "25. Actualizar Caso con ID inválido"
print_request "PUT $BASE_URL/api/casos/999999
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"descripcion\": \"Intento de actualización\"
}"
ACTUALIZAR_CASO_INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/api/casos/999999" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "descripcion": "Intento de actualización"
  }')
HTTP_CODE="${ACTUALIZAR_CASO_INVALID_RESPONSE: -3}"
ACTUALIZAR_CASO_INVALID_BODY="${ACTUALIZAR_CASO_INVALID_RESPONSE%???}"
print_response "$ACTUALIZAR_CASO_INVALID_BODY"
if [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "400" ]; then
    log_test_result 0 "Actualizar Caso Inexistente - Validación funcionando correctamente"
else
    log_test_result 1 "Actualizar Caso Inexistente - Validación no funcionando (HTTP $HTTP_CODE)"
fi

# ==========================================
# 🎯 ENDPOINTS DE ASIGNACIÓN DE FISCALES
# ==========================================

print_header "FASE 6: ASIGNACIÓN Y REASIGNACIÓN DE FISCALES"

# 26. Asignar Fiscal a Caso (si se creó uno)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "26. Asignar Fiscal a Caso"
    print_request "POST $BASE_URL/api/casos/$CASO_ID/asignar-fiscal
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"idFiscal\": $PRIMER_FISCAL
}"
    ASIGNAR_FISCAL_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos/$CASO_ID/asignar-fiscal" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"idFiscal\": $PRIMER_FISCAL
      }")
    HTTP_CODE="${ASIGNAR_FISCAL_RESPONSE: -3}"
    ASIGNAR_FISCAL_BODY="${ASIGNAR_FISCAL_RESPONSE%???}"
    print_response "$ASIGNAR_FISCAL_BODY"
    if [ "$HTTP_CODE" = "200" ]; then
        log_test_result 0 "Asignar Fiscal - Fiscal asignado correctamente"
    else
        log_test_result 1 "Asignar Fiscal - Error al asignar fiscal (HTTP $HTTP_CODE)"
    fi
else
    log_test_result 1 "Asignar Fiscal - No hay caso para probar (caso no creado previamente)"
fi

# 27. Asignar Fiscal sin idFiscal (debe fallar)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "27. Asignar Fiscal sin ID (Validación)"
    print_request "POST $BASE_URL/api/casos/$CASO_ID/asignar-fiscal
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {}"
    ASIGNAR_SIN_ID_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos/$CASO_ID/asignar-fiscal" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{}')
    HTTP_CODE="${ASIGNAR_SIN_ID_RESPONSE: -3}"
    ASIGNAR_SIN_ID_BODY="${ASIGNAR_SIN_ID_RESPONSE%???}"
    print_response "$ASIGNAR_SIN_ID_BODY"
    if [ "$HTTP_CODE" = "400" ]; then
        log_test_result 0 "Asignar Fiscal Sin ID - Validación funcionando correctamente"
    else
        log_test_result 1 "Asignar Fiscal Sin ID - Validación no funcionando (HTTP $HTTP_CODE)"
    fi
fi

# 28. Reasignar Fiscal a Caso (si se creó uno y se asignó fiscal)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "28. Reasignar Fiscal de Caso"
    # Buscar otro fiscal diferente para reasignar
    SEGUNDO_FISCAL=3
    print_request "POST $BASE_URL/api/casos/$CASO_ID/reasignar-fiscal
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {
  \"idNuevoFiscal\": $SEGUNDO_FISCAL
}"
    REASIGNAR_FISCAL_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos/$CASO_ID/reasignar-fiscal" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"idNuevoFiscal\": $SEGUNDO_FISCAL
      }")
    HTTP_CODE="${REASIGNAR_FISCAL_RESPONSE: -3}"
    REASIGNAR_FISCAL_BODY="${REASIGNAR_FISCAL_RESPONSE%???}"
    print_response "$REASIGNAR_FISCAL_BODY"
    if [ "$HTTP_CODE" = "200" ]; then
        log_test_result 0 "Reasignar Fiscal - Fiscal reasignado correctamente"
    else
        log_test_result 1 "Reasignar Fiscal - Error al reasignar fiscal (HTTP $HTTP_CODE)"
    fi
else
    log_test_result 1 "Reasignar Fiscal - No hay caso para probar (caso no creado previamente)"
fi

# 29. Reasignar Fiscal sin datos (debe fallar)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "29. Reasignar Fiscal sin nuevo ID (Validación)"
    print_request "POST $BASE_URL/api/casos/$CASO_ID/reasignar-fiscal
Headers: Authorization: Bearer [ADMIN_TOKEN]
Body: {}"
    REASIGNAR_SIN_ID_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos/$CASO_ID/reasignar-fiscal" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{}')
    HTTP_CODE="${REASIGNAR_SIN_ID_RESPONSE: -3}"
    REASIGNAR_SIN_ID_BODY="${REASIGNAR_SIN_ID_RESPONSE%???}"
    print_response "$REASIGNAR_SIN_ID_BODY"
    if [ "$HTTP_CODE" = "400" ]; then
        log_test_result 0 "Reasignar Sin ID - Validación funcionando correctamente"
    else
        log_test_result 1 "Reasignar Sin ID - Validación no funcionando (HTTP $HTTP_CODE)"
    fi
fi

# ==========================================
# 🔐 PRUEBAS DE SEGURIDAD Y AUTORIZACIÓN
# ==========================================

print_header "FASE 7: PRUEBAS DE SEGURIDAD Y AUTORIZACIÓN"

# 30. Acceso sin token de autorización
print_subheader "30. Acceso sin token (Debe fallar)"
print_request "GET $BASE_URL/api/casos"
SIN_TOKEN_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos")
HTTP_CODE="${SIN_TOKEN_RESPONSE: -3}"
SIN_TOKEN_BODY="${SIN_TOKEN_RESPONSE%???}"
print_response "$SIN_TOKEN_BODY"
if [ "$HTTP_CODE" = "401" ]; then
    log_test_result 0 "Acceso Sin Token - Seguridad funcionando correctamente"
else
    log_test_result 1 "Acceso Sin Token - Fallo de seguridad (HTTP $HTTP_CODE)"
fi

# 31. Acceso con token inválido
print_subheader "31. Acceso con token inválido (Debe fallar)"
print_request "GET $BASE_URL/api/casos
Headers: Authorization: Bearer token_invalido"
TOKEN_INVALID_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos" \
  -H "Authorization: Bearer token_invalido")
HTTP_CODE="${TOKEN_INVALID_RESPONSE: -3}"
TOKEN_INVALID_BODY="${TOKEN_INVALID_RESPONSE%???}"
print_response "$TOKEN_INVALID_BODY"
if [ "$HTTP_CODE" = "401" ]; then
    log_test_result 0 "Token Inválido - Seguridad funcionando correctamente"
else
    log_test_result 1 "Token Inválido - Fallo de seguridad (HTTP $HTTP_CODE)"
fi

# 32. Fiscal intentando asignar casos (debe fallar por permisos)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "32. Fiscal intentando asignar caso (Sin permisos)"
    print_request "POST $BASE_URL/api/casos/$CASO_ID/asignar-fiscal
Headers: Authorization: Bearer [FISCAL1_TOKEN]
Body: {
  \"idFiscal\": $PRIMER_FISCAL
}"
    FISCAL_ASIGNA_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/casos/$CASO_ID/asignar-fiscal" \
      -H "Authorization: Bearer $FISCAL1_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"idFiscal\": $PRIMER_FISCAL
      }")
    HTTP_CODE="${FISCAL_ASIGNA_RESPONSE: -3}"
    FISCAL_ASIGNA_BODY="${FISCAL_ASIGNA_RESPONSE%???}"
    print_response "$FISCAL_ASIGNA_BODY"
    if [ "$HTTP_CODE" = "403" ]; then
        log_test_result 0 "Fiscal Asigna Caso - Control de permisos funcionando correctamente"
    else
        log_test_result 1 "Fiscal Asigna Caso - Control de permisos no funcionando (HTTP $HTTP_CODE)"
    fi
fi

# 33. Fiscal intentando actualizar caso (debe fallar por permisos)
if [ -n "$CASO_ID" ] && [ "$CASO_ID" != "null" ]; then
    print_subheader "33. Fiscal intentando actualizar caso (Sin permisos)"
    print_request "PUT $BASE_URL/api/casos/$CASO_ID
Headers: Authorization: Bearer [FISCAL1_TOKEN]
Body: {
  \"descripcion\": \"Intento de actualización por fiscal\"
}"
    FISCAL_ACTUALIZA_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/api/casos/$CASO_ID" \
      -H "Authorization: Bearer $FISCAL1_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "descripcion": "Intento de actualización por fiscal"
      }')
    HTTP_CODE="${FISCAL_ACTUALIZA_RESPONSE: -3}"
    FISCAL_ACTUALIZA_BODY="${FISCAL_ACTUALIZA_RESPONSE%???}"
    print_response "$FISCAL_ACTUALIZA_BODY"
    if [ "$HTTP_CODE" = "403" ]; then
        log_test_result 0 "Fiscal Actualiza Caso - Control de permisos funcionando correctamente"
    else
        log_test_result 1 "Fiscal Actualiza Caso - Control de permisos no funcionando (HTTP $HTTP_CODE)"
    fi
fi

# ==========================================
# 📊 VERIFICACIÓN FINAL DE FUNCIONALIDADES
# ==========================================

print_header "FASE 8: VERIFICACIÓN FINAL"

# 34. Verificar que Mis Casos muestra el caso asignado/reasignado
print_subheader "34. Verificación Final - Mis Casos actualizado"
print_request "GET $BASE_URL/api/casos/mis-casos
Headers: Authorization: Bearer [FISCAL1_TOKEN]"
VERIFICACION_FINAL_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/mis-casos" \
  -H "Authorization: Bearer $FISCAL1_TOKEN")
HTTP_CODE="${VERIFICACION_FINAL_RESPONSE: -3}"
VERIFICACION_FINAL_BODY="${VERIFICACION_FINAL_RESPONSE%???}"
print_response "$VERIFICACION_FINAL_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Verificación Final - Mis Casos funcionando correctamente"
else
    log_test_result 1 "Verificación Final - Error en Mis Casos (HTTP $HTTP_CODE)"
fi

# 35. Estadísticas finales para verificar que se reflejan los cambios
print_subheader "35. Estadísticas Finales"
print_request "GET $BASE_URL/api/casos/estadisticas
Headers: Authorization: Bearer [ADMIN_TOKEN]"
ESTADISTICAS_FINAL_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/casos/estadisticas" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
HTTP_CODE="${ESTADISTICAS_FINAL_RESPONSE: -3}"
ESTADISTICAS_FINAL_BODY="${ESTADISTICAS_FINAL_RESPONSE%???}"
print_response "$ESTADISTICAS_FINAL_BODY"
if [ "$HTTP_CODE" = "200" ]; then
    log_test_result 0 "Estadísticas Finales - Reporte actualizado correctamente"
else
    log_test_result 1 "Estadísticas Finales - Error en reporte final (HTTP $HTTP_CODE)"
fi

# ==========================================
# 📝 RESUMEN Y DOCUMENTACIÓN
# ==========================================

print_final_stats

echo -e "\n${BLUE}==========================================${NC}"
echo -e "${BLUE}📋 DOCUMENTACIÓN DE ENDPOINTS PROBADOS${NC}"
echo -e "${BLUE}==========================================${NC}"

echo -e "\n${CYAN}🔍 ENDPOINTS DE CONSULTA:${NC}"
echo "• GET /api/casos/estados - Obtener estados de caso disponibles"
echo "• GET /api/casos/fiscales - Obtener fiscales activos"
echo "• GET /api/casos - Listar casos con paginación y filtros"
echo "• GET /api/casos/buscar?termino=X - Buscar casos por término"
echo "• GET /api/casos/mis-casos - Casos asignados al usuario actual"
echo "• GET /api/casos/fiscal/:id - Casos asignados a un fiscal específico"
echo "• GET /api/casos/estado/:id - Casos filtrados por estado"
echo "• GET /api/casos/:id - Obtener caso específico por ID"
echo "• GET /api/casos/estadisticas - Estadísticas generales de casos"

echo -e "\n${CYAN}✏️ ENDPOINTS DE MODIFICACIÓN:${NC}"
echo "• POST /api/casos - Crear nuevo caso"
echo "• PUT /api/casos/:id - Actualizar caso existente"
echo "• POST /api/casos/:id/asignar-fiscal - Asignar fiscal a caso"
echo "• POST /api/casos/:id/reasignar-fiscal - Reasignar fiscal de caso"

echo -e "\n${CYAN}🔐 PERMISOS REQUERIDOS:${NC}"
echo "• CASE_VIEW - Ver casos"
echo "• CASE_VIEW_OWN - Ver casos propios"
echo "• CASE_VIEW_ALL - Ver todos los casos"
echo "• CASE_CREATE - Crear casos"
echo "• CASE_EDIT - Editar casos"
echo "• CASE_ASSIGN - Asignar fiscales"
echo "• CASE_REASSIGN - Reasignar fiscales"
echo "• CASE_STATS - Ver estadísticas"

echo -e "\n${CYAN}📊 PARÁMETROS DE CONSULTA SOPORTADOS:${NC}"
echo "• pagina - Número de página (default: 1)"
echo "• resultadosPorPagina - Resultados por página (default: 10)"
echo "• idEstadoCaso - Filtrar por estado"
echo "• idFiscalAsignado - Filtrar por fiscal"
echo "• busqueda/termino - Término de búsqueda"

echo -e "\n${CYAN}📄 ESTRUCTURA DE RESPUESTA ESPERADA:${NC}"
echo "• success: boolean - Indica si la operación fue exitosa"
echo "• message: string - Mensaje descriptivo de la operación"
echo "• data: object/array - Datos solicitados"
echo "• paginacion: object - Información de paginación (cuando aplica)"

echo -e "\n🏁 ${GREEN}Pruebas completadas. Revisa el resumen anterior para ver el estado de cada endpoint.${NC}"
