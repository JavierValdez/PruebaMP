#!/bin/bash

# Script para probar específicamente el cambio de contraseña
# Este script crea un usuario nuevo, hace login, cambia la contraseña y verifica

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"

echo -e "${BLUE}🔐 Prueba Específica de Cambio de Contraseña${NC}"
echo "========================================"

# Generar un nombre de usuario único
TIMESTAMP=$(date +%s)
USERNAME="pwd_test_$TIMESTAMP"
ORIGINAL_PASSWORD="OriginalPass123"
NEW_PASSWORD="NewPass456"

echo -e "\n${YELLOW}📝 Datos de prueba:${NC}"
echo "Usuario: $USERNAME"
echo "Contraseña original: $ORIGINAL_PASSWORD"
echo "Nueva contraseña: $NEW_PASSWORD"

# 1. Registrar usuario
echo -e "\n${BLUE}1. Registrando usuario...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombreUsuario\": \"$USERNAME\",
    \"password\": \"$ORIGINAL_PASSWORD\",
    \"email\": \"$USERNAME@mp.gov\",
    \"primerNombre\": \"Test\",
    \"primerApellido\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | jq '.'

REGISTER_SUCCESS=$(echo "$REGISTER_RESPONSE" | jq -r '.success')
if [ "$REGISTER_SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Error en registro${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Usuario registrado exitosamente${NC}"

# 2. Login inicial
echo -e "\n${BLUE}2. Login inicial...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombreUsuario\": \"$USERNAME\",
    \"password\": \"$ORIGINAL_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq '.'

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Error obteniendo token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login exitoso, token obtenido${NC}"

# 3. Cambiar contraseña
echo -e "\n${BLUE}3. Cambiando contraseña...${NC}"
CHANGE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"currentPassword\": \"$ORIGINAL_PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\"
  }")

echo "$CHANGE_RESPONSE" | jq '.'

CHANGE_SUCCESS=$(echo "$CHANGE_RESPONSE" | jq -r '.success')
if [ "$CHANGE_SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Error cambiando contraseña${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Contraseña cambiada exitosamente${NC}"

# 4. Verificar login con nueva contraseña
echo -e "\n${BLUE}4. Verificando login con nueva contraseña...${NC}"
NEW_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombreUsuario\": \"$USERNAME\",
    \"password\": \"$NEW_PASSWORD\"
  }")

echo "$NEW_LOGIN_RESPONSE" | jq '.'

NEW_LOGIN_SUCCESS=$(echo "$NEW_LOGIN_RESPONSE" | jq -r '.success')
if [ "$NEW_LOGIN_SUCCESS" != "true" ]; then
    echo -e "${RED}❌ Error: No se puede hacer login con nueva contraseña${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login con nueva contraseña exitoso${NC}"

# 5. Verificar que contraseña anterior no funciona
echo -e "\n${BLUE}5. Verificando que contraseña anterior no funciona...${NC}"
OLD_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"nombreUsuario\": \"$USERNAME\",
    \"password\": \"$ORIGINAL_PASSWORD\"
  }")

echo "$OLD_LOGIN_RESPONSE" | jq '.'

OLD_LOGIN_SUCCESS=$(echo "$OLD_LOGIN_RESPONSE" | jq -r '.success')
if [ "$OLD_LOGIN_SUCCESS" = "false" ]; then
    echo -e "${GREEN}✅ Contraseña anterior correctamente invalidada${NC}"
else
    echo -e "${RED}❌ ERROR: Contraseña anterior aún funciona${NC}"
    exit 1
fi

# Resumen final
echo -e "\n${GREEN}🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE${NC}"
echo "========================================"
echo -e "${BLUE}Resumen:${NC}"
echo "✅ Usuario registrado"
echo "✅ Login inicial exitoso"
echo "✅ Contraseña cambiada"
echo "✅ Login con nueva contraseña exitoso"
echo "✅ Contraseña anterior invalidada"
echo -e "\n${GREEN}El cambio de contraseña funciona correctamente ✨${NC}"
