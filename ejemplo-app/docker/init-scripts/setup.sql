-- Base de datos limpia para el proyecto EvidexBD
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EvidexBD')
BEGIN
    CREATE DATABASE EvidexBD;
END;
GO

