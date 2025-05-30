#!/bin/bash

# Script para verificar y crear la base de datos PruebaMPDB2

echo "🔍 Verificando bases de datos disponibles..."

# Conectar y verificar bases de datos existentes
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT name FROM sys.databases WHERE name LIKE '\''%Prueba%'\'' OR name LIKE '\''%MP%'\'' ORDER BY name"
  }'
