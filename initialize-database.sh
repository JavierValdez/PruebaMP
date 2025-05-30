#!/bin/bash

# This script initializes the database in the running container
echo "Initializing database..."
sqlcmd -S localhost,1433 -U sa -P StrongP@ssword123 -i ./docker/init-scripts/setup.sql -C

echo "Database initialization complete."
