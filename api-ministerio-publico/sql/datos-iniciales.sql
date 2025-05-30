-- Procedimiento adicional para obtener permisos de usuario
-- Este SP debe ejecutarse después del script principal setup.sql

USE PruebaMPDB2;
GO

PRINT 'Creando SP adicional: sp_Usuario_ObtenerPermisos...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ObtenerPermisos
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT p.IdPermiso, p.ClavePermiso, p.DescripcionPermiso
    FROM dbo.Permisos p
    INNER JOIN dbo.RolPermisos rp ON p.IdPermiso = rp.IdPermiso
    INNER JOIN dbo.UsuarioRoles ur ON rp.IdRol = ur.IdRol
    WHERE ur.IdUsuario = @IdUsuario
    ORDER BY p.ClavePermiso;
END
GO

-- Insertar datos iniciales para testing
PRINT 'Insertando datos iniciales...';
GO

-- Estados de caso iniciales
IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = 'Abierto')
BEGIN
    INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado) 
    VALUES ('Abierto', 'Caso abierto para investigación');
END

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = 'En Proceso')
BEGIN
    INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado) 
    VALUES ('En Proceso', 'Caso en proceso de investigación');
END

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = 'Cerrado')
BEGIN
    INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado) 
    VALUES ('Cerrado', 'Caso cerrado');
END

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = 'Suspendido')
BEGIN
    INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado) 
    VALUES ('Suspendido', 'Caso suspendido temporalmente');
END

-- Fiscalías iniciales
IF NOT EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE NombreFiscalia = 'Fiscalía Central')
BEGIN
    INSERT INTO dbo.Fiscalias (NombreFiscalia, Ubicacion, Activa) 
    VALUES ('Fiscalía Central', 'Centro de la Ciudad', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE NombreFiscalia = 'Fiscalía Norte')
BEGIN
    INSERT INTO dbo.Fiscalias (NombreFiscalia, Ubicacion, Activa) 
    VALUES ('Fiscalía Norte', 'Zona Norte', 1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE NombreFiscalia = 'Fiscalía Sur')
BEGIN
    INSERT INTO dbo.Fiscalias (NombreFiscalia, Ubicacion, Activa) 
    VALUES ('Fiscalía Sur', 'Zona Sur', 1);
END

-- Roles iniciales
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE NombreRol = 'Administrador')
BEGIN
    INSERT INTO dbo.Roles (NombreRol, DescripcionRol) 
    VALUES ('Administrador', 'Administrador del sistema con acceso total');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE NombreRol = 'Fiscal')
BEGIN
    INSERT INTO dbo.Roles (NombreRol, DescripcionRol) 
    VALUES ('Fiscal', 'Fiscal con acceso a casos asignados');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE NombreRol = 'Secretario')
BEGIN
    INSERT INTO dbo.Roles (NombreRol, DescripcionRol) 
    VALUES ('Secretario', 'Secretario con acceso limitado');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE NombreRol = 'Supervisor')
BEGIN
    INSERT INTO dbo.Roles (NombreRol, DescripcionRol) 
    VALUES ('Supervisor', 'Supervisor con acceso a múltiples casos');
END

-- Permisos iniciales
IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_VIEW')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_VIEW', 'Ver casos del sistema');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_VIEW_ALL')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_VIEW_ALL', 'Ver todos los casos del sistema');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_VIEW_OWN')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_VIEW_OWN', 'Ver casos propios asignados');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_CREATE')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_CREATE', 'Crear nuevos casos');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_EDIT')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_EDIT', 'Editar casos existentes');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_DELETE')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_DELETE', 'Eliminar casos');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_ASSIGN')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_ASSIGN', 'Asignar casos a fiscales');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_REASSIGN')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_REASSIGN', 'Reasignar casos entre fiscales');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'CASE_STATS')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('CASE_STATS', 'Ver estadísticas de casos');
END

IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = 'USER_MANAGE')
BEGIN
    INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso) 
    VALUES ('USER_MANAGE', 'Gestionar usuarios del sistema');
END

-- Asignar permisos a roles
-- Administrador: todos los permisos
DECLARE @IdRolAdmin INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Administrador');
DECLARE @IdRolFiscal INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Fiscal');
DECLARE @IdRolSecretario INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Secretario');
DECLARE @IdRolSupervisor INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Supervisor');

-- Permisos para Administrador (todos)
INSERT INTO dbo.RolPermisos (IdRol, IdPermiso)
SELECT @IdRolAdmin, IdPermiso FROM dbo.Permisos
WHERE NOT EXISTS (SELECT 1 FROM dbo.RolPermisos WHERE IdRol = @IdRolAdmin AND IdPermiso = dbo.Permisos.IdPermiso);

-- Permisos para Fiscal
INSERT INTO dbo.RolPermisos (IdRol, IdPermiso)
SELECT @IdRolFiscal, IdPermiso FROM dbo.Permisos 
WHERE ClavePermiso IN ('CASE_VIEW', 'CASE_VIEW_OWN', 'CASE_EDIT', 'CASE_CREATE')
AND NOT EXISTS (SELECT 1 FROM dbo.RolPermisos WHERE IdRol = @IdRolFiscal AND IdPermiso = dbo.Permisos.IdPermiso);

-- Permisos para Secretario
INSERT INTO dbo.RolPermisos (IdRol, IdPermiso)
SELECT @IdRolSecretario, IdPermiso FROM dbo.Permisos 
WHERE ClavePermiso IN ('CASE_VIEW', 'CASE_CREATE')
AND NOT EXISTS (SELECT 1 FROM dbo.RolPermisos WHERE IdRol = @IdRolSecretario AND IdPermiso = dbo.Permisos.IdPermiso);

-- Permisos para Supervisor
INSERT INTO dbo.RolPermisos (IdRol, IdPermiso)
SELECT @IdRolSupervisor, IdPermiso FROM dbo.Permisos 
WHERE ClavePermiso IN ('CASE_VIEW', 'CASE_VIEW_ALL', 'CASE_EDIT', 'CASE_ASSIGN', 'CASE_REASSIGN', 'CASE_STATS')
AND NOT EXISTS (SELECT 1 FROM dbo.RolPermisos WHERE IdRol = @IdRolSupervisor AND IdPermiso = dbo.Permisos.IdPermiso);

PRINT 'Datos iniciales insertados exitosamente.';
GO
