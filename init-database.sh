#!/bin/bash

# Esperar a que SQL Server esté listo
echo "Esperando a que SQL Server esté listo..."
sleep 30

# Inicializar la base de datos
echo "Inicializando la base de datos..."
docker exec -it mp-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P StrongP@ssword123 -i /docker-entrypoint-initdb.d/setup.sql

echo "Base de datos inicializada exitosamente."
