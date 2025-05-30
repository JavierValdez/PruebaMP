#!/bin/bash

# Function to run the SQL Server process
run_sql_server() {
    /opt/mssql/bin/sqlservr
}

# Function to initialize the database
initialize_database() {
    echo "Waiting for SQL Server to start..."
    sleep 10
    
    for i in {1..30}; do
        echo "Attempting connection ${i}/30..."
        /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" &> /dev/null
        if [ $? -eq 0 ]; then
            echo "SQL Server is ready! Initializing database..."
            if [ -f /usr/src/app/setup.sql ]; then
                /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i /usr/src/app/setup.sql
                if [ $? -eq 0 ]; then
                    echo "Database initialization completed successfully."
                else
                    echo "Database initialization failed."
                fi
            else
                echo "No setup.sql file found, skipping initialization."
            fi
            break
        fi
        sleep 3
    done
    
    if [ $i -eq 30 ]; then
        echo "Timeout: Could not connect to SQL Server."
    fi
}

# Start SQL Server in the background
run_sql_server &
SQL_PID=$!

# Wait a bit for SQL Server to start accepting connections
sleep 15

# Run initialization
initialize_database

# Wait for SQL Server process
wait $SQL_PID
