#!/bin/bash

# Inicializa la base de datos EvidexBD en el contenedor en ejecución
echo "Inicializando base de datos EvidexBD..."
sqlcmd -S localhost,1433 -U sa -P StrongP@ssword123 -i ./docker/init-scripts/setup.sql -C

echo "Base de datos EvidexBD inicializada."

