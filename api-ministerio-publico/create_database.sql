-- Script para crear la base de datos PruebaMPDB2 si no existe

-- Verificar si la base de datos existe
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PruebaMPDB2')
BEGIN
    PRINT 'Creando base de datos PruebaMPDB2...';
    CREATE DATABASE PruebaMPDB2;
    PRINT 'Base de datos PruebaMPDB2 creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos PruebaMPDB2 ya existe.';
END

-- Usar la base de datos
USE PruebaMPDB2;

-- Verificar que estamos en la base de datos correcta
SELECT DB_NAME() AS 'Base de datos actual';

-- Listar tablas existentes (si las hay)
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Listar stored procedures existentes (si los hay)
SELECT ROUTINE_NAME 
FROM INFORMATION_SCHEMA.ROUTINES 
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;
