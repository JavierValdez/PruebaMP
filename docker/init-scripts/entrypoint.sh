#!/bin/bash

# Función para inicializar la base de datos
function initialize_database() {
    # Esperar a que SQL Server esté listo
    echo "Esperando a que SQL Server esté listo..."
    for i in {1..60}; do
        # Comprobar si SQL Server está aceptando conexiones
        /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -Q "SELECT 1" &> /dev/null
        if [ $? -eq 0 ]; then
            echo "SQL Server está listo, inicializando la base de datos..."
            # Ejecutar script de inicialización
            /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $MSSQL_SA_PASSWORD -i /usr/src/app/setup.sql
            echo "Inicialización completada."
            break
        fi
        echo "Esperando... ${i}/60"
        sleep 1
    done
}

# Iniciar la inicialización en segundo plano
initialize_database &

# Start SQL Server en primer plano
/opt/mssql/bin/sqlservr
