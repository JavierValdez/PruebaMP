-- Crea una base de datos limpia para Evidex
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'EvidexBD')
BEGIN
    CREATE DATABASE EvidexBD;
END;
GO

