-- Procedimiento adicional para obtener permisos de usuario
-- Este SP debe ejecutarse después del script principal setup.sql

USE master;
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

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = 'Pendiente')
BEGIN
    INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado) 
    VALUES ('Pendiente', 'Caso pendiente de asignación o procesamiento');
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

-- ============================================================================
-- DATOS DE PRUEBA PARA TESTING
-- ============================================================================

PRINT 'Insertando datos de prueba...';
GO

-- Usuarios de prueba
DECLARE @IdRolAdmin INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Administrador');
DECLARE @IdRolFiscal INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Fiscal');
DECLARE @IdRolSupervisor INT = (SELECT IdRol FROM dbo.Roles WHERE NombreRol = 'Supervisor');

-- Usuario Administrador
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = 'admin')
BEGIN
    INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Email, PrimerNombre, PrimerApellido)
    VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@mp.gob.sv', 'Administrador', 'Sistema');
    
    DECLARE @IdUsuarioAdmin INT = SCOPE_IDENTITY();
    INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol) VALUES (@IdUsuarioAdmin, @IdRolAdmin);
END

-- Fiscales de prueba
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = 'fiscal1')
BEGIN
    INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Email, PrimerNombre, PrimerApellido)
    VALUES ('fiscal1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fiscal1@mp.gob.sv', 'Juan Carlos', 'Martínez');
    
    DECLARE @IdUsuarioFiscal1 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol) VALUES (@IdUsuarioFiscal1, @IdRolFiscal);
    
    DECLARE @IdFiscalia1 INT = (SELECT IdFiscalia FROM dbo.Fiscalias WHERE NombreFiscalia = 'Fiscalía Central');
    INSERT INTO dbo.Fiscales (IdUsuario, CodigoFiscal, IdFiscalia)
    VALUES (@IdUsuarioFiscal1, 'FC-001', @IdFiscalia1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = 'fiscal2')
BEGIN
    INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Email, PrimerNombre, PrimerApellido)
    VALUES ('fiscal2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fiscal2@mp.gob.sv', 'María Elena', 'Rodríguez');
    
    DECLARE @IdUsuarioFiscal2 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol) VALUES (@IdUsuarioFiscal2, @IdRolFiscal);
    
    INSERT INTO dbo.Fiscales (IdUsuario, CodigoFiscal, IdFiscalia)
    VALUES (@IdUsuarioFiscal2, 'FC-002', @IdFiscalia1);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = 'fiscal3')
BEGIN
    INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Email, PrimerNombre, PrimerApellido)
    VALUES ('fiscal3', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fiscal3@mp.gob.sv', 'Carlos Alberto', 'Hernández');
    
    DECLARE @IdUsuarioFiscal3 INT = SCOPE_IDENTITY();
    INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol) VALUES (@IdUsuarioFiscal3, @IdRolFiscal);
    
    DECLARE @IdFiscalia2 INT = (SELECT IdFiscalia FROM dbo.Fiscalias WHERE NombreFiscalia = 'Fiscalía Norte');
    INSERT INTO dbo.Fiscales (IdUsuario, CodigoFiscal, IdFiscalia)
    VALUES (@IdUsuarioFiscal3, 'FN-001', @IdFiscalia2);
END

-- Supervisor de prueba
IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = 'supervisor1')
BEGIN
    INSERT INTO dbo.Usuarios (NombreUsuario, PasswordHash, Email, PrimerNombre, PrimerApellido)
    VALUES ('supervisor1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supervisor1@mp.gob.sv', 'Ana Sofía', 'López');
    
    DECLARE @IdUsuarioSupervisor INT = SCOPE_IDENTITY();
    INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol) VALUES (@IdUsuarioSupervisor, @IdRolSupervisor);
END

-- Casos de prueba
DECLARE @IdEstadoAbierto INT = (SELECT IdEstadoCaso FROM dbo.EstadosCaso WHERE NombreEstado = 'Abierto');
DECLARE @IdEstadoPendiente INT = (SELECT IdEstadoCaso FROM dbo.EstadosCaso WHERE NombreEstado = 'Pendiente');
DECLARE @IdEstadoEnProceso INT = (SELECT IdEstadoCaso FROM dbo.EstadosCaso WHERE NombreEstado = 'En Proceso');
DECLARE @IdEstadoCerrado INT = (SELECT IdEstadoCaso FROM dbo.EstadosCaso WHERE NombreEstado = 'Cerrado');

DECLARE @IdFiscal1 INT = (SELECT IdFiscal FROM dbo.Fiscales WHERE CodigoFiscal = 'FC-001');
DECLARE @IdFiscal2 INT = (SELECT IdFiscal FROM dbo.Fiscales WHERE CodigoFiscal = 'FC-002');
DECLARE @IdFiscal3 INT = (SELECT IdFiscal FROM dbo.Fiscales WHERE CodigoFiscal = 'FN-001');

DECLARE @IdUsuarioCreador INT = (SELECT IdUsuario FROM dbo.Usuarios WHERE NombreUsuario = 'admin');

-- Casos de prueba
IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-001')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-001', 'Caso de robo con intimidación en zona central', @IdEstadoAbierto, 'Caso recién abierto, recopilando evidencias iniciales', @IdFiscal1, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-002')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-002', 'Investigación por fraude financiero', @IdEstadoEnProceso, 'Análisis de documentos bancarios en curso', @IdFiscal1, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-003')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-003', 'Caso de violencia doméstica', @IdEstadoPendiente, 'Pendiente de asignación de fiscal especializado', NULL, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-004')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-004', 'Delito de corrupción en institución pública', @IdEstadoEnProceso, 'Investigación de irregularidades administrativas', @IdFiscal2, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-005')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-005', 'Homicidio en zona norte', @IdEstadoAbierto, 'Investigación criminalística iniciada', @IdFiscal3, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-006')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-006', 'Caso de tráfico de drogas resuelto', @IdEstadoCerrado, 'Caso cerrado con sentencia condenatoria', @IdFiscal2, @IdUsuarioCreador, @IdUsuarioCreador);
END

IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = 'MP-2024-007')
BEGIN
    INSERT INTO dbo.Casos (NumeroCasoUnico, Descripcion, IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion)
    VALUES ('MP-2024-007', 'Estafa mediante medios electrónicos', @IdEstadoPendiente, 'Caso pendiente de revisión técnica', NULL, @IdUsuarioCreador, @IdUsuarioCreador);
END

PRINT 'Datos de prueba insertados exitosamente.';
PRINT 'Credenciales de prueba:';
PRINT '- admin/password (Administrador)';
PRINT '- fiscal1/password (Fiscal - Fiscalía Central)';
PRINT '- fiscal2/password (Fiscal - Fiscalía Central)';
PRINT '- fiscal3/password (Fiscal - Fiscalía Norte)';
PRINT '- supervisor1/password (Supervisor)';
GO
