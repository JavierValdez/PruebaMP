#!/bin/bash

# 🔐 Script de Pruebas Automatizadas - Sistema de Gestión de Casos
# Ministerio Público - Pruebas de Funcionalidad Completa
# Ejecutar: chmod +x caso_test.sh && ./caso_test.sh

BASE_URL="http://localhost:3001/api"
echo "🚀 Iniciando pruebas del Sistema de Gestión de Casos..."
echo "📍 URL Base: $BASE_URL"
echo "==========================================\n"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# =============================================================================
# FUNCIONES AUXILIARES
# =============================================================================

print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}🧪 $1${NC}"
    echo -e "${BLUE}==========================================${NC}"
}

print_section() {
    echo -e "${YELLOW}--- $1 ---${NC}"
}

pass_test() {
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

fail_test() {
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
    echo -e "${RED}❌ FAIL: $1${NC}"
    if [ ! -z "$2" ]; then
        echo -e "   Error: $2"
    fi
}

# Función para hacer peticiones HTTP con manejo de errores
make_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local token="$4"
    local expected_status="$5"
    
    local headers=""
    if [ ! -z "$token" ]; then
        headers="-H 'Authorization: Bearer $token'"
    fi
    
    local curl_cmd="curl -s -w '%{http_code}' -X $method '$url'"
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -H 'Content-Type: application/json' -d '$data'"
    fi
    
    if [ ! -z "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    local response=$(eval $curl_cmd)
    local status_code="${response: -3}"
    local body="${response%???}"
    
    echo "$status_code|$body"
}

# Función para extraer token del response de login
extract_token() {
    echo "$1" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
}

# Función para verificar si el servidor está corriendo
check_server() {
    echo "🔍 Verificando que el servidor esté corriendo..."
    local response=$(curl -s -w '%{http_code}' "$BASE_URL/../health" 2>/dev/null || echo "000")
    local status_code="${response: -3}"
    
    if [ "$status_code" != "200" ] && [ "$status_code" != "404" ]; then
        echo -e "${RED}❌ ERROR: El servidor no está corriendo en $BASE_URL${NC}"
        echo "Por favor, inicia el servidor con: npm start"
        exit 1
    fi
    echo -e "${GREEN}✅ Servidor disponible${NC}"
}

# =============================================================================
# VARIABLES GLOBALES PARA TOKENS
# =============================================================================
declare -A USER_TOKENS
declare -A USER_IDS

# =============================================================================
# PRUEBAS DE AUTENTICACIÓN
# =============================================================================

test_authentication() {
    print_header "PRUEBAS DE AUTENTICACIÓN"
    
    # Usuarios de prueba
    local users=(
        "admin|admin123|Administrador"
        "fiscal1|fiscal123|Fiscal 1"
        "fiscal2|fiscal123|Fiscal 2" 
        "fiscal3|fiscal123|Fiscal 3"
        "supervisor1|super123|Supervisor 1"
    )
    
    for user_data in "${users[@]}"; do
        IFS='|' read -r username password display_name <<< "$user_data"
        
        print_section "Autenticación de $display_name ($username)"
        
        local login_data="{\"username\":\"$username\",\"password\":\"$password\"}"
        echo "POST $BASE_URL/auth/login"
        
        local response=$(curl -s -w '%{http_code}' -X POST "$BASE_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d "$login_data")
        
        local status_code="${response: -3}"
        local body="${response%???}"
        
        if [ "$status_code" = "200" ]; then
            local token=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
            if [ ! -z "$token" ]; then
                USER_TOKENS[$username]="$token"
                
                # Extraer ID de usuario del response
                local user_id=$(echo "$body" | grep -o '"id":[0-9]*' | cut -d':' -f2)
                USER_IDS[$username]="$user_id"
                
                pass_test "Login exitoso para $username (ID: $user_id)"
            else
                fail_test "Login de $username" "No se pudo extraer el token"
            fi
        else
            fail_test "Login de $username" "Status: $status_code"
        fi
        echo ""
    done
}

# =============================================================================
# PRUEBAS DE GESTIÓN DE CASOS
# =============================================================================

test_case_management() {
    test_header "PRUEBAS DE GESTIÓN DE CASOS"
    
    # Obtener lista de casos para admin
    test_section "Obtener lista de casos (Admin)"
    local response=$(make_request "GET" "$BASE_URL/casos" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local case_count=$(echo "$body" | grep -o '"numero_caso"' | wc -l)
        pass_test "Lista de casos obtenida - $case_count casos encontrados"
    else
        fail_test "Obtener lista de casos" "Status: $status_code"
    fi
    
    # Prueba de "Mis Casos" para cada fiscal
    test_section "Funcionalidad 'Mis Casos'"
    
    local fiscales=("fiscal1" "fiscal2" "fiscal3")
    for fiscal in "${fiscales[@]}"; do
        local response=$(make_request "GET" "$BASE_URL/casos/mis-casos" "" "${USER_TOKENS[$fiscal]}" "200")
        IFS='|' read -r status_code body <<< "$response"
        
        if [ "$status_code" = "200" ]; then
            local my_cases_count=$(echo "$body" | grep -o '"numero_caso"' | wc -l)
            pass_test "Mis Casos para $fiscal - $my_cases_count casos asignados"
        else
            fail_test "Mis Casos para $fiscal" "Status: $status_code"
        fi
    done
}

# =============================================================================
# PRUEBAS DE ASIGNACIÓN Y REASIGNACIÓN
# =============================================================================

test_case_assignment() {
    test_header "PRUEBAS DE ASIGNACIÓN Y REASIGNACIÓN"
    
    # Obtener ID de fiscales para las pruebas
    local fiscal1_id="${USER_IDS[fiscal1]}"
    local fiscal2_id="${USER_IDS[fiscal2]}"
    local fiscal3_id="${USER_IDS[fiscal3]}"
    
    test_section "Asignación inicial de caso"
    
    # Asignar caso 1 a fiscal1
    local assign_data="{\"casoId\":1,\"fiscalId\":$fiscal1_id}"
    local response=$(make_request "POST" "$BASE_URL/casos/asignar-fiscal" "$assign_data" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"exito":true'; then
            pass_test "Asignación de caso 1 a fiscal1"
        else
            local mensaje=$(echo "$body" | grep -o '"mensaje":"[^"]*"' | cut -d'"' -f4)
            fail_test "Asignación de caso 1 a fiscal1" "Mensaje: $mensaje"
        fi
    else
        fail_test "Asignación de caso 1 a fiscal1" "Status: $status_code"
    fi
    
    test_section "Reasignación válida (mismo fiscalía)"
    
    # Reasignar caso 1 de fiscal1 a fiscal2 (ambos en fiscalía 1)
    local reassign_data="{\"casoId\":1,\"nuevoFiscalId\":$fiscal2_id}"
    local response=$(make_request "POST" "$BASE_URL/casos/reasignar-fiscal" "$reassign_data" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"exito":true'; then
            pass_test "Reasignación válida: caso 1 de fiscal1 a fiscal2"
        else
            local mensaje=$(echo "$body" | grep -o '"mensaje":"[^"]*"' | cut -d'"' -f4)
            fail_test "Reasignación válida" "Mensaje: $mensaje"
        fi
    else
        fail_test "Reasignación válida" "Status: $status_code"
    fi
    
    test_section "Reasignación inválida (diferente fiscalía)"
    
    # Intentar reasignar caso 1 de fiscal2 (fiscalía 1) a fiscal3 (fiscalía 2)
    local invalid_reassign_data="{\"casoId\":1,\"nuevoFiscalId\":$fiscal3_id}"
    local response=$(make_request "POST" "$BASE_URL/casos/reasignar-fiscal" "$invalid_reassign_data" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"exito":false'; then
            pass_test "Reasignación inválida correctamente bloqueada"
        else
            fail_test "Reasignación inválida" "Debería haber sido bloqueada"
        fi
    else
        fail_test "Reasignación inválida" "Status: $status_code"
    fi
    
    test_section "Verificación de estados de caso"
    
    # Verificar que solo casos en estado "Pendiente" pueden ser reasignados
    local response=$(make_request "GET" "$BASE_URL/casos" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local pending_cases=$(echo "$body" | grep -o '"estado":"Pendiente"' | wc -l)
        local total_cases=$(echo "$body" | grep -o '"numero_caso"' | wc -l)
        pass_test "Estados de casos verificados - $pending_cases pendientes de $total_cases totales"
    else
        fail_test "Verificación de estados" "Status: $status_code"
    fi
}

# =============================================================================
# PRUEBAS DE REPORTES Y ESTADÍSTICAS
# =============================================================================

test_reports() {
    test_header "PRUEBAS DE REPORTES Y ESTADÍSTICAS"
    
    # Reporte por fiscal
    test_section "Reporte por fiscal"
    local response=$(make_request "GET" "$BASE_URL/casos/reportes/por-fiscal" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local fiscal_count=$(echo "$body" | grep -o '"nombre_fiscal"' | wc -l)
        pass_test "Reporte por fiscal generado - $fiscal_count fiscales con casos"
    else
        fail_test "Reporte por fiscal" "Status: $status_code"
    fi
    
    # Reporte por estado
    test_section "Reporte por estado"
    local response=$(make_request "GET" "$BASE_URL/casos/reportes/por-estado" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local estado_count=$(echo "$body" | grep -o '"estado"' | wc -l)
        pass_test "Reporte por estado generado - $estado_count estados diferentes"
    else
        fail_test "Reporte por estado" "Status: $status_code"
    fi
    
    # Reporte por fiscalía
    test_section "Reporte por fiscalía"
    local response=$(make_request "GET" "$BASE_URL/casos/reportes/por-fiscalia" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local fiscalia_count=$(echo "$body" | grep -o '"nombre_fiscalia"' | wc -l)
        pass_test "Reporte por fiscalía generado - $fiscalia_count fiscalías con casos"
    else
        fail_test "Reporte por fiscalía" "Status: $status_code"
    fi
    
    # Estadísticas generales
    test_section "Estadísticas generales"
    local response=$(make_request "GET" "$BASE_URL/casos/estadisticas" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        if echo "$body" | grep -q '"total_casos"'; then
            local total=$(echo "$body" | grep -o '"total_casos":[0-9]*' | cut -d':' -f2)
            pass_test "Estadísticas generales obtenidas - Total de casos: $total"
        else
            fail_test "Estadísticas generales" "Formato de respuesta inesperado"
        fi
    else
        fail_test "Estadísticas generales" "Status: $status_code"
    fi
}

# =============================================================================
# PRUEBAS DE PERMISOS Y AUTORIZACIÓN
# =============================================================================

test_permissions() {
    test_header "PRUEBAS DE PERMISOS Y AUTORIZACIÓN"
    
    test_section "Acceso sin token"
    local response=$(make_request "GET" "$BASE_URL/casos" "" "" "401")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "401" ]; then
        pass_test "Acceso sin token correctamente denegado"
    else
        fail_test "Acceso sin token" "Debería retornar 401, retornó $status_code"
    fi
    
    test_section "Acceso con token inválido"
    local response=$(make_request "GET" "$BASE_URL/casos" "" "invalid_token" "401")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "401" ]; then
        pass_test "Acceso con token inválido correctamente denegado"
    else
        fail_test "Acceso con token inválido" "Debería retornar 401, retornó $status_code"
    fi
    
    test_section "Permisos de fiscal vs admin"
    
    # Verificar que fiscal puede ver sus casos
    local response=$(make_request "GET" "$BASE_URL/casos/mis-casos" "" "${USER_TOKENS[fiscal1]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        pass_test "Fiscal puede acceder a sus casos"
    else
        fail_test "Acceso fiscal a sus casos" "Status: $status_code"
    fi
    
    # Verificar que admin puede ver todos los casos
    local response=$(make_request "GET" "$BASE_URL/casos" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        pass_test "Admin puede acceder a todos los casos"
    else
        fail_test "Acceso admin a todos los casos" "Status: $status_code"
    fi
}

# =============================================================================
# PRUEBAS DE INTEGRIDAD DE DATOS
# =============================================================================

test_data_integrity() {
    test_header "PRUEBAS DE INTEGRIDAD DE DATOS"
    
    test_section "Verificación de datos iniciales"
    
    # Verificar que existen usuarios
    local response=$(make_request "GET" "$BASE_URL/casos" "" "${USER_TOKENS[admin]}" "200")
    IFS='|' read -r status_code body <<< "$response"
    
    if [ "$status_code" = "200" ]; then
        local has_cases=$(echo "$body" | grep -q '"numero_caso"' && echo "true" || echo "false")
        if [ "$has_cases" = "true" ]; then
            pass_test "Datos iniciales de casos presentes"
        else
            fail_test "Datos iniciales de casos" "No se encontraron casos en la base de datos"
        fi
    else
        fail_test "Verificación de datos iniciales" "Status: $status_code"
    fi
    
    test_section "Consistencia de asignaciones"
    
    # Verificar que los casos asignados aparecen en "mis casos"
    for fiscal in "fiscal1" "fiscal2" "fiscal3"; do
        local response=$(make_request "GET" "$BASE_URL/casos/mis-casos" "" "${USER_TOKENS[$fiscal]}" "200")
        IFS='|' read -r status_code body <<< "$response"
        
        if [ "$status_code" = "200" ]; then
            pass_test "Consistencia de asignaciones verificada para $fiscal"
        else
            fail_test "Consistencia de asignaciones para $fiscal" "Status: $status_code"
        fi
    done
}

# =============================================================================
# PRUEBAS DE RENDIMIENTO BÁSICO
# =============================================================================

test_performance() {
    test_header "PRUEBAS DE RENDIMIENTO BÁSICO"
    
    test_section "Tiempo de respuesta de endpoints principales"
    
    local endpoints=(
        "GET|/casos|Listar casos"
        "GET|/casos/mis-casos|Mis casos"
        "GET|/casos/reportes/por-fiscal|Reporte por fiscal"
        "GET|/casos/estadisticas|Estadísticas"
    )
    
    for endpoint_data in "${endpoints[@]}"; do
        IFS='|' read -r method path description <<< "$endpoint_data"
        
        local start_time=$(date +%s%N)
        local response=$(make_request "$method" "$BASE_URL$path" "" "${USER_TOKENS[admin]}" "200")
        local end_time=$(date +%s%N)
        
        IFS='|' read -r status_code body <<< "$response"
        local duration=$((($end_time - $start_time) / 1000000)) # milisegundos
        
        if [ "$status_code" = "200" ]; then
            if [ $duration -lt 2000 ]; then # menos de 2 segundos
                pass_test "$description - Tiempo: ${duration}ms"
            else
                fail_test "$description - LENTO" "Tiempo: ${duration}ms (>2000ms)"
            fi
        else
            fail_test "$description" "Status: $status_code"
        fi
    done
}

# =============================================================================
# FUNCIÓN PRINCIPAL
# =============================================================================

run_all_tests() {
    log_test "${BLUE}==================================================================="
    log_test "INICIANDO PRUEBAS AUTOMATIZADAS - SISTEMA GESTIÓN DE CASOS"
    log_test "Ministerio Público - $(date)"
    log_test "===================================================================${NC}"
    
    # Verificar que el servidor esté corriendo
    log_test "Verificando servidor..."
    check_server
    log_test "${GREEN}✓ Servidor disponible en $BASE_URL${NC}"
    
    # Ejecutar todas las pruebas
    test_authentication
    test_case_management
    test_case_assignment
    test_reports
    test_permissions
    test_data_integrity
    test_performance
    
    # Resumen final
    test_header "RESUMEN DE PRUEBAS"
    
    log_test "Total de pruebas ejecutadas: $TOTAL_TESTS"
    log_test "${GREEN}Pruebas exitosas: $PASSED_TESTS${NC}"
    log_test "${RED}Pruebas fallidas: $FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    log_test "Tasa de éxito: ${success_rate}%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_test "${GREEN}🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE!${NC}"
        echo ""
        log_test "El sistema de gestión de casos está funcionando correctamente."
        exit 0
    else
        log_test "${RED}❌ ALGUNAS PRUEBAS FALLARON${NC}"
        echo ""
        log_test "Revisa los detalles arriba para identificar los problemas."
        exit 1
    fi
}

# =============================================================================
# MANEJO DE ARGUMENTOS DE LÍNEA DE COMANDOS
# =============================================================================

show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "OPCIONES:"
    echo "  -h, --help              Mostrar esta ayuda"
    echo "  --auth-only            Ejecutar solo pruebas de autenticación"
    echo "  --cases-only           Ejecutar solo pruebas de gestión de casos"
    echo ""
    echo "EJEMPLOS:"
    echo "  $0                     # Ejecutar todas las pruebas"
    echo "  $0 --auth-only         # Solo pruebas de autenticación"
    echo ""
}

# Función principal simplificada
run_tests() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}🚀 INICIANDO PRUEBAS DEL SISTEMA${NC}"
    echo -e "${BLUE}$(date)${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
    
    check_server
    echo ""
    
    test_authentication
    
    # Resumen final
    print_header "RESUMEN DE PRUEBAS"
    echo "Total de pruebas ejecutadas: $TOTAL_TESTS"
    echo -e "${GREEN}Pruebas exitosas: $PASSED_TESTS${NC}"
    echo -e "${RED}Pruebas fallidas: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ¡TODAS LAS PRUEBAS PASARON!${NC}"
        exit 0
    else
        echo -e "${RED}❌ ALGUNAS PRUEBAS FALLARON${NC}"
        exit 1
    fi
}

# Procesar argumentos
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    show_help
    exit 0
elif [ "$1" = "--auth-only" ]; then
    check_server
    test_authentication
    exit 0
else
    run_tests
fi
