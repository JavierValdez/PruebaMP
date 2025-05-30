-- Crear base de datos
CREATE DATABASE PruebaMPDB;
GO

USE PruebaMPDB;
GO

-- ============================================================================
-- Script para crear la Base de Datos del Sistema de Gestión de Casos MP
-- Versión: 1.0
-- Base de Datos: SQL Server
-- ============================================================================

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- SECCIÓN 1: Creación de Tablas sin dependencias de FK directas (o con pocas)
-- Estas son tablas "lookup" o entidades base.
-- ============================================================================

PRINT 'Creando Tabla: EstadosCaso...';
CREATE TABLE dbo.EstadosCaso (
    IdEstadoCaso INT IDENTITY(1,1) NOT NULL,
    NombreEstado NVARCHAR(50) NOT NULL,
    DescripcionEstado NVARCHAR(255) NULL,
    CONSTRAINT PK_EstadosCaso PRIMARY KEY CLUSTERED (IdEstadoCaso ASC),
    CONSTRAINT UQ_EstadosCaso_NombreEstado UNIQUE (NombreEstado)
);
GO

PRINT 'Creando Tabla: Fiscalias...';
CREATE TABLE dbo.Fiscalias (
    IdFiscalia INT IDENTITY(1,1) NOT NULL,
    NombreFiscalia NVARCHAR(150) NOT NULL,
    Ubicacion NVARCHAR(255) NULL,
    Activa BIT NOT NULL CONSTRAINT DF_Fiscalias_Activa DEFAULT 1,
    CONSTRAINT PK_Fiscalias PRIMARY KEY CLUSTERED (IdFiscalia ASC),
    CONSTRAINT UQ_Fiscalias_NombreFiscalia UNIQUE (NombreFiscalia)
);
GO

PRINT 'Creando Tabla: Roles...';
CREATE TABLE dbo.Roles (
    IdRol INT IDENTITY(1,1) NOT NULL,
    NombreRol NVARCHAR(50) NOT NULL,
    DescripcionRol NVARCHAR(255) NULL,
    CONSTRAINT PK_Roles PRIMARY KEY CLUSTERED (IdRol ASC),
    CONSTRAINT UQ_Roles_NombreRol UNIQUE (NombreRol)
);
GO

PRINT 'Creando Tabla: Permisos...';
CREATE TABLE dbo.Permisos (
    IdPermiso INT IDENTITY(1,1) NOT NULL,
    ClavePermiso NVARCHAR(100) NOT NULL, -- Ej: 'CASE_CREATE', 'CASE_VIEW_ALL'
    DescripcionPermiso NVARCHAR(255) NULL,
    CONSTRAINT PK_Permisos PRIMARY KEY CLUSTERED (IdPermiso ASC),
    CONSTRAINT UQ_Permisos_ClavePermiso UNIQUE (ClavePermiso)
);
GO

PRINT 'Creando Tabla: Usuarios...';
CREATE TABLE dbo.Usuarios (
    IdUsuario INT IDENTITY(1,1) NOT NULL,
    NombreUsuario NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    Email NVARCHAR(254) NOT NULL,
    PrimerNombre NVARCHAR(100) NOT NULL,
    SegundoNombre NVARCHAR(100) NULL,
    PrimerApellido NVARCHAR(100) NOT NULL,
    SegundoApellido NVARCHAR(100) NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Usuarios_Activo DEFAULT 1,
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Usuarios_FechaCreacion DEFAULT GETUTCDATE(),
    FechaUltimoLogin DATETIME2 NULL,
    CONSTRAINT PK_Usuarios PRIMARY KEY CLUSTERED (IdUsuario ASC),
    CONSTRAINT UQ_Usuarios_NombreUsuario UNIQUE (NombreUsuario),
    CONSTRAINT UQ_Usuarios_Email UNIQUE (Email)
);
GO

-- ============================================================================
-- SECCIÓN 2: Creación de Tablas con dependencias de FK a tablas de Sección 1
-- ============================================================================

PRINT 'Creando Tabla: Fiscales...';
CREATE TABLE dbo.Fiscales (
    IdFiscal INT IDENTITY(1,1) NOT NULL,
    IdUsuario INT NOT NULL,
    CodigoFiscal NVARCHAR(50) NOT NULL,
    IdFiscalia INT NOT NULL,
    Activo BIT NOT NULL CONSTRAINT DF_Fiscales_Activo DEFAULT 1,
    CONSTRAINT PK_Fiscales PRIMARY KEY CLUSTERED (IdFiscal ASC),
    CONSTRAINT UQ_Fiscales_CodigoFiscal UNIQUE (CodigoFiscal),
    CONSTRAINT UQ_Fiscales_IdUsuario UNIQUE (IdUsuario), -- Un usuario solo puede ser un fiscal
    CONSTRAINT FK_Fiscales_Usuarios FOREIGN KEY (IdUsuario) REFERENCES dbo.Usuarios(IdUsuario),
    CONSTRAINT FK_Fiscales_Fiscalias FOREIGN KEY (IdFiscalia) REFERENCES dbo.Fiscalias(IdFiscalia)
);
GO

PRINT 'Creando Tabla: UsuarioRoles...';
CREATE TABLE dbo.UsuarioRoles (
    IdUsuario INT NOT NULL,
    IdRol INT NOT NULL,
    FechaAsignacion DATETIME2 NOT NULL CONSTRAINT DF_UsuarioRoles_FechaAsignacion DEFAULT GETUTCDATE(),
    CONSTRAINT PK_UsuarioRoles PRIMARY KEY CLUSTERED (IdUsuario ASC, IdRol ASC),
    CONSTRAINT FK_UsuarioRoles_Usuarios FOREIGN KEY (IdUsuario) REFERENCES dbo.Usuarios(IdUsuario) ON DELETE CASCADE, -- Si se elimina el usuario, se quitan sus roles
    CONSTRAINT FK_UsuarioRoles_Roles FOREIGN KEY (IdRol) REFERENCES dbo.Roles(IdRol) ON DELETE CASCADE -- Si se elimina el rol, se quita de los usuarios
);
GO

PRINT 'Creando Tabla: RolPermisos...';
CREATE TABLE dbo.RolPermisos (
    IdRol INT NOT NULL,
    IdPermiso INT NOT NULL,
    CONSTRAINT PK_RolPermisos PRIMARY KEY CLUSTERED (IdRol ASC, IdPermiso ASC),
    CONSTRAINT FK_RolPermisos_Roles FOREIGN KEY (IdRol) REFERENCES dbo.Roles(IdRol) ON DELETE CASCADE, -- Si se elimina el rol, se quitan sus permisos
    CONSTRAINT FK_RolPermisos_Permisos FOREIGN KEY (IdPermiso) REFERENCES dbo.Permisos(IdPermiso) ON DELETE CASCADE -- Si se elimina el permiso, se quita de los roles
);
GO

-- ============================================================================
-- SECCIÓN 3: Creación de Tablas con dependencias a tablas de Secciones 1 y 2
-- ============================================================================

PRINT 'Creando Tabla: Casos...';
CREATE TABLE dbo.Casos (
    IdCaso INT IDENTITY(1,1) NOT NULL,
    NumeroCasoUnico NVARCHAR(30) NOT NULL,
    Descripcion NVARCHAR(MAX) NOT NULL,
    FechaCreacion DATETIME2 NOT NULL CONSTRAINT DF_Casos_FechaCreacion DEFAULT GETUTCDATE(),
    FechaUltimaActualizacion DATETIME2 NOT NULL CONSTRAINT DF_Casos_FechaUltimaActualizacion DEFAULT GETUTCDATE(),
    IdEstadoCaso INT NOT NULL,
    DetalleProgreso NVARCHAR(MAX) NULL,
    IdFiscalAsignado INT NULL,
    IdUsuarioCreacion INT NOT NULL,
    IdUsuarioUltimaModificacion INT NOT NULL,
    CONSTRAINT PK_Casos PRIMARY KEY CLUSTERED (IdCaso ASC),
    CONSTRAINT UQ_Casos_NumeroCasoUnico UNIQUE (NumeroCasoUnico),
    CONSTRAINT FK_Casos_EstadosCaso FOREIGN KEY (IdEstadoCaso) REFERENCES dbo.EstadosCaso(IdEstadoCaso),
    CONSTRAINT FK_Casos_Fiscales FOREIGN KEY (IdFiscalAsignado) REFERENCES dbo.Fiscales(IdFiscal),
    CONSTRAINT FK_Casos_Usuarios_Creacion FOREIGN KEY (IdUsuarioCreacion) REFERENCES dbo.Usuarios(IdUsuario),
    CONSTRAINT FK_Casos_Usuarios_Modificacion FOREIGN KEY (IdUsuarioUltimaModificacion) REFERENCES dbo.Usuarios(IdUsuario)
);
GO

-- ============================================================================
-- SECCIÓN 4: Creación de Tablas con dependencias a tablas de Secciones anteriores
-- ============================================================================

PRINT 'Creando Tabla: LogReasignacionFallida...';
CREATE TABLE dbo.LogReasignacionFallida (
    IdLog INT IDENTITY(1,1) NOT NULL,
    IdCaso INT NOT NULL,
    IdFiscalAnterior INT NULL,
    IdFiscalDestinoIntentado INT NOT NULL,
    IdFiscaliaFiscalAnterior_Snapshot INT NULL, -- Almacena el IdFiscalia del fiscal anterior en ese momento
    IdFiscaliaFiscalDestino_Snapshot INT NOT NULL, -- Almacena el IdFiscalia del fiscal destino en ese momento
    IdEstadoCasoAlMomento_Snapshot INT NOT NULL, -- Almacena el IdEstadoCaso del caso en ese momento
    FechaIntento DATETIME2 NOT NULL CONSTRAINT DF_LogReasignacionFallida_FechaIntento DEFAULT GETUTCDATE(),
    IdUsuarioSolicitante INT NOT NULL,
    MotivoFallo NVARCHAR(500) NOT NULL,
    CONSTRAINT PK_LogReasignacionFallida PRIMARY KEY CLUSTERED (IdLog ASC),
    CONSTRAINT FK_LogReasignacionFallida_Casos FOREIGN KEY (IdCaso) REFERENCES dbo.Casos(IdCaso) ON DELETE CASCADE, -- Si se elimina el caso, se eliminan sus logs
    CONSTRAINT FK_LogReasignacionFallida_FiscalAnterior FOREIGN KEY (IdFiscalAnterior) REFERENCES dbo.Fiscales(IdFiscal),
    CONSTRAINT FK_LogReasignacionFallida_FiscalDestinoIntentado FOREIGN KEY (IdFiscalDestinoIntentado) REFERENCES dbo.Fiscales(IdFiscal),
    CONSTRAINT FK_LogReasignacionFallida_Usuarios_Solicitante FOREIGN KEY (IdUsuarioSolicitante) REFERENCES dbo.Usuarios(IdUsuario)
);
GO

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS PARA LA BASE DE DATOS MP
-- ============================================================================
-------------------------------------------------------------------------------
-- ESTADOSCASO
-------------------------------------------------------------------------------

PRINT 'Creando SP: sp_EstadoCaso_Crear...';
GO
CREATE PROCEDURE dbo.sp_EstadoCaso_Crear
    @NombreEstado NVARCHAR(50),
    @DescripcionEstado NVARCHAR(255) = NULL,
    @IdEstadoCaso INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE NombreEstado = @NombreEstado)
        BEGIN
            RAISERROR('El nombre del estado ya existe.', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.EstadosCaso (NombreEstado, DescripcionEstado)
        VALUES (@NombreEstado, @DescripcionEstado);

        SET @IdEstadoCaso = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        -- Manejar el error (loggear, etc.)
        THROW; -- Relanza el error original
    END CATCH
END
GO

PRINT 'Creando SP: sp_EstadoCaso_ListarTodos...';
GO
CREATE PROCEDURE dbo.sp_EstadoCaso_ListarTodos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdEstadoCaso, NombreEstado, DescripcionEstado
    FROM dbo.EstadosCaso
    ORDER BY NombreEstado;
END
GO

PRINT 'Creando SP: sp_EstadoCaso_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_EstadoCaso_ObtenerPorId
    @IdEstadoCaso INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdEstadoCaso, NombreEstado, DescripcionEstado
    FROM dbo.EstadosCaso
    WHERE IdEstadoCaso = @IdEstadoCaso;
END
GO

-------------------------------------------------------------------------------
-- FISCALIAS
-------------------------------------------------------------------------------

PRINT 'Creando SP: sp_Fiscalia_Crear...';
GO
CREATE PROCEDURE dbo.sp_Fiscalia_Crear
    @NombreFiscalia NVARCHAR(150),
    @Ubicacion NVARCHAR(255) = NULL,
    @Activa BIT = 1,
    @IdFiscalia INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE NombreFiscalia = @NombreFiscalia)
        BEGIN
            RAISERROR('El nombre de la fiscalía ya existe.', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.Fiscalias (NombreFiscalia, Ubicacion, Activa)
        VALUES (@NombreFiscalia, @Ubicacion, @Activa);

        SET @IdFiscalia = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Fiscalia_ListarTodas...';
GO
CREATE PROCEDURE dbo.sp_Fiscalia_ListarTodas
    @IncluirInactivas BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdFiscalia, NombreFiscalia, Ubicacion, Activa
    FROM dbo.Fiscalias
    WHERE Activa = 1 OR @IncluirInactivas = 1
    ORDER BY NombreFiscalia;
END
GO

PRINT 'Creando SP: sp_Fiscalia_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_Fiscalia_ObtenerPorId
    @IdFiscalia INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdFiscalia, NombreFiscalia, Ubicacion, Activa
    FROM dbo.Fiscalias
    WHERE IdFiscalia = @IdFiscalia;
END
GO

PRINT 'Creando SP: sp_Fiscalia_Actualizar...';
GO
CREATE PROCEDURE dbo.sp_Fiscalia_Actualizar
    @IdFiscalia INT,
    @NombreFiscalia NVARCHAR(150),
    @Ubicacion NVARCHAR(255) = NULL,
    @Activa BIT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE NombreFiscalia = @NombreFiscalia AND IdFiscalia <> @IdFiscalia)
        BEGIN
            RAISERROR('Ya existe otra fiscalía con ese nombre.', 16, 1);
            RETURN;
        END

        UPDATE dbo.Fiscalias
        SET NombreFiscalia = @NombreFiscalia,
            Ubicacion = @Ubicacion,
            Activa = @Activa
        WHERE IdFiscalia = @IdFiscalia;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Fiscalía no encontrada.', 16, 1);
            RETURN;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO


-------------------------------------------------------------------------------
-- ROLES
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_Rol_Crear...';
GO
CREATE PROCEDURE dbo.sp_Rol_Crear
    @NombreRol NVARCHAR(50),
    @DescripcionRol NVARCHAR(255) = NULL,
    @IdRol INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Roles WHERE NombreRol = @NombreRol)
        BEGIN
            RAISERROR('El nombre del rol ya existe.', 16, 1);
            RETURN;
        END
        INSERT INTO dbo.Roles (NombreRol, DescripcionRol)
        VALUES (@NombreRol, @DescripcionRol);
        SET @IdRol = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Rol_ListarTodos...';
GO
CREATE PROCEDURE dbo.sp_Rol_ListarTodos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdRol, NombreRol, DescripcionRol FROM dbo.Roles ORDER BY NombreRol;
END
GO

PRINT 'Creando SP: sp_Rol_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_Rol_ObtenerPorId
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdRol, NombreRol, DescripcionRol FROM dbo.Roles WHERE IdRol = @IdRol;
END
GO

-------------------------------------------------------------------------------
-- PERMISOS
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_Permiso_Crear...';
GO
CREATE PROCEDURE dbo.sp_Permiso_Crear
    @ClavePermiso NVARCHAR(100),
    @DescripcionPermiso NVARCHAR(255) = NULL,
    @IdPermiso INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Permisos WHERE ClavePermiso = @ClavePermiso)
        BEGIN
            RAISERROR('La clave del permiso ya existe.', 16, 1);
            RETURN;
        END
        INSERT INTO dbo.Permisos (ClavePermiso, DescripcionPermiso)
        VALUES (@ClavePermiso, @DescripcionPermiso);
        SET @IdPermiso = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Permiso_ListarTodos...';
GO
CREATE PROCEDURE dbo.sp_Permiso_ListarTodos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdPermiso, ClavePermiso, DescripcionPermiso FROM dbo.Permisos ORDER BY ClavePermiso;
END
GO

-------------------------------------------------------------------------------
-- USUARIOS
-------------------------------------------------------------------------------

PRINT 'Creando SP: sp_Usuario_Crear...';
GO
CREATE PROCEDURE dbo.sp_Usuario_Crear
    @NombreUsuario NVARCHAR(100),
    @PasswordHash NVARCHAR(256),
    @Email NVARCHAR(254),
    @PrimerNombre NVARCHAR(100),
    @SegundoNombre NVARCHAR(100) = NULL,
    @PrimerApellido NVARCHAR(100),
    @SegundoApellido NVARCHAR(100) = NULL,
    @Activo BIT = 1,
    @IdUsuario INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE NombreUsuario = @NombreUsuario)
        BEGIN
            RAISERROR('El nombre de usuario ya existe.', 16, 1);
            RETURN;
        END
        IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = @Email)
        BEGIN
            RAISERROR('El email ya está registrado.', 16, 1);
            RETURN;
        END

        INSERT INTO dbo.Usuarios (
            NombreUsuario, PasswordHash, Email, PrimerNombre, SegundoNombre,
            PrimerApellido, SegundoApellido, Activo, FechaCreacion
        ) VALUES (
            @NombreUsuario, @PasswordHash, @Email, @PrimerNombre, @SegundoNombre,
            @PrimerApellido, @SegundoApellido, @Activo, GETUTCDATE()
        );
        SET @IdUsuario = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Usuario_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ObtenerPorId
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        IdUsuario, NombreUsuario, Email, PrimerNombre, SegundoNombre,
        PrimerApellido, SegundoApellido, Activo, FechaCreacion, FechaUltimoLogin
        -- No devolver PasswordHash por seguridad general en SPs de obtención
    FROM dbo.Usuarios
    WHERE IdUsuario = @IdUsuario AND Activo = 1;
END
GO

PRINT 'Creando SP: sp_Usuario_ObtenerPorNombreUsuario...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ObtenerPorNombreUsuario
    @NombreUsuario NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        IdUsuario, NombreUsuario, PasswordHash, Email, PrimerNombre, SegundoNombre,
        PrimerApellido, SegundoApellido, Activo, FechaCreacion, FechaUltimoLogin
    FROM dbo.Usuarios
    WHERE NombreUsuario = @NombreUsuario AND Activo = 1;
END
GO

PRINT 'Creando SP: sp_Usuario_Actualizar...';
GO
CREATE PROCEDURE dbo.sp_Usuario_Actualizar
    @IdUsuario INT,
    @Email NVARCHAR(254),
    @PrimerNombre NVARCHAR(100),
    @SegundoNombre NVARCHAR(100) = NULL,
    @PrimerApellido NVARCHAR(100),
    @SegundoApellido NVARCHAR(100) = NULL,
    @Activo BIT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Usuarios WHERE Email = @Email AND IdUsuario <> @IdUsuario)
        BEGIN
            RAISERROR('El email ya está registrado por otro usuario.', 16, 1);
            RETURN;
        END

        UPDATE dbo.Usuarios
        SET Email = @Email,
            PrimerNombre = @PrimerNombre,
            SegundoNombre = @SegundoNombre,
            PrimerApellido = @PrimerApellido,
            SegundoApellido = @SegundoApellido,
            Activo = @Activo
        WHERE IdUsuario = @IdUsuario;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Usuario no encontrado o sin cambios.', 16, 1); -- O simplemente no hacer nada si es 0
            RETURN;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Usuario_ActualizarPassword...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ActualizarPassword
    @IdUsuario INT,
    @NuevoPasswordHash NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Usuarios
    SET PasswordHash = @NuevoPasswordHash
    WHERE IdUsuario = @IdUsuario;
END
GO

PRINT 'Creando SP: sp_Usuario_ActualizarUltimoLogin...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ActualizarUltimoLogin
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Usuarios
    SET FechaUltimoLogin = GETUTCDATE()
    WHERE IdUsuario = @IdUsuario;
END
GO

PRINT 'Creando SP: sp_Usuario_ListarTodos...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ListarTodos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT IdUsuario, NombreUsuario, Email, PrimerNombre, SegundoNombre, PrimerApellido, SegundoApellido, Activo
    FROM dbo.Usuarios
    WHERE Activo = 1
    ORDER BY PrimerApellido, PrimerNombre;
END
GO

-------------------------------------------------------------------------------
-- FISCALES
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_Fiscal_Crear...';
GO
CREATE PROCEDURE dbo.sp_Fiscal_Crear
    @IdUsuario INT,
    @CodigoFiscal NVARCHAR(50),
    @IdFiscalia INT,
    @Activo BIT = 1,
    @IdFiscal INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE IdUsuario = @IdUsuario AND Activo = 1)
        BEGIN
            RAISERROR('El usuario base no existe o está inactivo.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        IF EXISTS (SELECT 1 FROM dbo.Fiscales WHERE IdUsuario = @IdUsuario)
        BEGIN
            RAISERROR('Este usuario ya está registrado como fiscal.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        IF EXISTS (SELECT 1 FROM dbo.Fiscales WHERE CodigoFiscal = @CodigoFiscal)
        BEGIN
            RAISERROR('El código fiscal ya existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        IF NOT EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE IdFiscalia = @IdFiscalia AND Activa = 1)
        BEGIN
            RAISERROR('La fiscalía no existe o está inactiva.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        INSERT INTO dbo.Fiscales (IdUsuario, CodigoFiscal, IdFiscalia, Activo)
        VALUES (@IdUsuario, @CodigoFiscal, @IdFiscalia, @Activo);
        SET @IdFiscal = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Fiscal_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_Fiscal_ObtenerPorId
    @IdFiscal INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        f.IdFiscal, f.CodigoFiscal, f.Activo AS FiscalActivo,
        u.IdUsuario, u.NombreUsuario, u.Email, u.PrimerNombre, u.SegundoNombre, u.PrimerApellido, u.SegundoApellido, u.Activo AS UsuarioActivo,
        fy.IdFiscalia, fy.NombreFiscalia, fy.Activa AS FiscaliaActiva
    FROM dbo.Fiscales f
    INNER JOIN dbo.Usuarios u ON f.IdUsuario = u.IdUsuario
    INNER JOIN dbo.Fiscalias fy ON f.IdFiscalia = fy.IdFiscalia
    WHERE f.IdFiscal = @IdFiscal;
END
GO

PRINT 'Creando SP: sp_Fiscal_ObtenerPorIdUsuario...';
GO
CREATE PROCEDURE dbo.sp_Fiscal_ObtenerPorIdUsuario
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        f.IdFiscal, f.CodigoFiscal, f.Activo AS FiscalActivo,
        u.IdUsuario, u.NombreUsuario, u.Email, u.PrimerNombre, u.SegundoNombre, u.PrimerApellido, u.SegundoApellido, u.Activo AS UsuarioActivo,
        fy.IdFiscalia, fy.NombreFiscalia, fy.Activa AS FiscaliaActiva
    FROM dbo.Fiscales f
    INNER JOIN dbo.Usuarios u ON f.IdUsuario = u.IdUsuario
    INNER JOIN dbo.Fiscalias fy ON f.IdFiscalia = fy.IdFiscalia
    WHERE f.IdUsuario = @IdUsuario;
END
GO


PRINT 'Creando SP: sp_Fiscal_ListarTodosActivos...';
GO
CREATE PROCEDURE dbo.sp_Fiscal_ListarTodosActivos
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        f.IdFiscal, f.CodigoFiscal,
        u.PrimerNombre, u.PrimerApellido, u.NombreUsuario,
        fy.NombreFiscalia
    FROM dbo.Fiscales f
    INNER JOIN dbo.Usuarios u ON f.IdUsuario = u.IdUsuario
    INNER JOIN dbo.Fiscalias fy ON f.IdFiscalia = fy.IdFiscalia
    WHERE f.Activo = 1 AND u.Activo = 1 AND fy.Activa = 1
    ORDER BY u.PrimerApellido, u.PrimerNombre;
END
GO

PRINT 'Creando SP: sp_Fiscal_Actualizar...';
GO
CREATE PROCEDURE dbo.sp_Fiscal_Actualizar
    @IdFiscal INT,
    @CodigoFiscal NVARCHAR(50),
    @IdFiscalia INT,
    @Activo BIT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Fiscales WHERE CodigoFiscal = @CodigoFiscal AND IdFiscal <> @IdFiscal)
        BEGIN
            RAISERROR('El código fiscal ya está en uso por otro fiscal.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        IF NOT EXISTS (SELECT 1 FROM dbo.Fiscalias WHERE IdFiscalia = @IdFiscalia AND Activa = 1)
        BEGIN
            RAISERROR('La fiscalía especificada no existe o está inactiva.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        UPDATE dbo.Fiscales
        SET CodigoFiscal = @CodigoFiscal,
            IdFiscalia = @IdFiscalia,
            Activo = @Activo
        WHERE IdFiscal = @IdFiscal;

        IF @@ROWCOUNT = 0
        BEGIN
            RAISERROR('Fiscal no encontrado.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

-------------------------------------------------------------------------------
-- USUARIOROLES
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_UsuarioRol_Asignar...';
GO
CREATE PROCEDURE dbo.sp_UsuarioRol_Asignar
    @IdUsuario INT,
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE IdUsuario = @IdUsuario)
        BEGIN RAISERROR('Usuario no existe.',16,1); RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE IdRol = @IdRol)
        BEGIN RAISERROR('Rol no existe.',16,1); RETURN; END

        IF NOT EXISTS (SELECT 1 FROM dbo.UsuarioRoles WHERE IdUsuario = @IdUsuario AND IdRol = @IdRol)
        BEGIN
            INSERT INTO dbo.UsuarioRoles (IdUsuario, IdRol, FechaAsignacion)
            VALUES (@IdUsuario, @IdRol, GETUTCDATE());
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_UsuarioRol_Remover...';
GO
CREATE PROCEDURE dbo.sp_UsuarioRol_Remover
    @IdUsuario INT,
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.UsuarioRoles
    WHERE IdUsuario = @IdUsuario AND IdRol = @IdRol;
END
GO

PRINT 'Creando SP: sp_Usuario_ObtenerRoles...';
GO
CREATE PROCEDURE dbo.sp_Usuario_ObtenerRoles
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.IdRol, r.NombreRol
    FROM dbo.Roles r
    INNER JOIN dbo.UsuarioRoles ur ON r.IdRol = ur.IdRol
    WHERE ur.IdUsuario = @IdUsuario;
END
GO

-------------------------------------------------------------------------------
-- ROLPERMISOS
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_RolPermiso_Asignar...';
GO
CREATE PROCEDURE dbo.sp_RolPermiso_Asignar
    @IdRol INT,
    @IdPermiso INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE IdRol = @IdRol)
        BEGIN RAISERROR('Rol no existe.',16,1); RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Permisos WHERE IdPermiso = @IdPermiso)
        BEGIN RAISERROR('Permiso no existe.',16,1); RETURN; END

        IF NOT EXISTS (SELECT 1 FROM dbo.RolPermisos WHERE IdRol = @IdRol AND IdPermiso = @IdPermiso)
        BEGIN
            INSERT INTO dbo.RolPermisos (IdRol, IdPermiso)
            VALUES (@IdRol, @IdPermiso);
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_RolPermiso_Remover...';
GO
CREATE PROCEDURE dbo.sp_RolPermiso_Remover
    @IdRol INT,
    @IdPermiso INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.RolPermisos
    WHERE IdRol = @IdRol AND IdPermiso = @IdPermiso;
END
GO

PRINT 'Creando SP: sp_Rol_ObtenerPermisos...';
GO
CREATE PROCEDURE dbo.sp_Rol_ObtenerPermisos
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.IdPermiso, p.ClavePermiso
    FROM dbo.Permisos p
    INNER JOIN dbo.RolPermisos rp ON p.IdPermiso = rp.IdPermiso
    WHERE rp.IdRol = @IdRol;
END
GO

PRINT 'Creando SP: sp_Usuario_TienePermiso...';
GO
CREATE PROCEDURE dbo.sp_Usuario_TienePermiso
    @IdUsuario INT,
    @ClavePermiso NVARCHAR(100),
    @TienePermiso BIT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @TienePermiso = 0;

    IF EXISTS (
        SELECT 1
        FROM dbo.UsuarioRoles ur
        INNER JOIN dbo.RolPermisos rp ON ur.IdRol = rp.IdRol
        INNER JOIN dbo.Permisos p ON rp.IdPermiso = p.IdPermiso
        WHERE ur.IdUsuario = @IdUsuario AND p.ClavePermiso = @ClavePermiso
    )
    BEGIN
        SET @TienePermiso = 1;
    END
END
GO

-------------------------------------------------------------------------------
-- CASOS
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_Caso_Crear...';
GO
CREATE PROCEDURE dbo.sp_Caso_Crear
    @NumeroCasoUnico NVARCHAR(30),
    @Descripcion NVARCHAR(MAX),
    @IdEstadoCaso INT,
    @DetalleProgreso NVARCHAR(MAX) = NULL,
    @IdFiscalAsignado INT = NULL,
    @IdUsuarioCreacion INT,
    @IdCasoCreado INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM dbo.Casos WHERE NumeroCasoUnico = @NumeroCasoUnico)
        BEGIN RAISERROR('Número de caso único ya existe.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE IdEstadoCaso = @IdEstadoCaso)
        BEGIN RAISERROR('Estado de caso no válido.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF @IdFiscalAsignado IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Fiscales WHERE IdFiscal = @IdFiscalAsignado AND Activo = 1)
        BEGIN RAISERROR('Fiscal asignado no válido o inactivo.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE IdUsuario = @IdUsuarioCreacion AND Activo = 1)
        BEGIN RAISERROR('Usuario de creación no válido o inactivo.', 16, 1); ROLLBACK TRANSACTION; RETURN; END

        INSERT INTO dbo.Casos (
            NumeroCasoUnico, Descripcion, FechaCreacion, FechaUltimaActualizacion,
            IdEstadoCaso, DetalleProgreso, IdFiscalAsignado, IdUsuarioCreacion, IdUsuarioUltimaModificacion
        ) VALUES (
            @NumeroCasoUnico, @Descripcion, GETUTCDATE(), GETUTCDATE(),
            @IdEstadoCaso, @DetalleProgreso, @IdFiscalAsignado, @IdUsuarioCreacion, @IdUsuarioCreacion -- Modificador inicial es el creador
        );
        SET @IdCasoCreado = SCOPE_IDENTITY();
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_Caso_Actualizar...';
GO
CREATE PROCEDURE dbo.sp_Caso_Actualizar
    @IdCaso INT,
    @Descripcion NVARCHAR(MAX),
    @IdEstadoCaso INT,
    @DetalleProgreso NVARCHAR(MAX) = NULL,
    -- @IdFiscalAsignado INT = NULL, -- La asignación se maneja por otro SP
    @IdUsuarioModificacion INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE IdCaso = @IdCaso)
        BEGIN RAISERROR('Caso no encontrado.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.EstadosCaso WHERE IdEstadoCaso = @IdEstadoCaso)
        BEGIN RAISERROR('Estado de caso no válido.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE IdUsuario = @IdUsuarioModificacion AND Activo = 1)
        BEGIN RAISERROR('Usuario de modificación no válido o inactivo.', 16, 1); ROLLBACK TRANSACTION; RETURN; END
        -- IF @IdFiscalAsignado IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Fiscales WHERE IdFiscal = @IdFiscalAsignado AND Activo = 1)
        -- BEGIN RAISERROR('Fiscal asignado no válido o inactivo.', 16, 1); ROLLBACK TRANSACTION; RETURN; END

        UPDATE dbo.Casos
        SET Descripcion = @Descripcion,
            FechaUltimaActualizacion = GETUTCDATE(),
            IdEstadoCaso = @IdEstadoCaso,
            DetalleProgreso = @DetalleProgreso,
            -- IdFiscalAsignado = @IdFiscalAsignado, -- Se maneja por sp_Caso_AsignarFiscal o sp_Caso_ReasignarFiscalValidado
            IdUsuarioUltimaModificacion = @IdUsuarioModificacion
        WHERE IdCaso = @IdCaso;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO


PRINT 'Creando SP: sp_Caso_ObtenerPorId...';
GO
CREATE PROCEDURE dbo.sp_Caso_ObtenerPorId
    @IdCaso INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        c.IdCaso, c.NumeroCasoUnico, c.Descripcion, c.FechaCreacion, c.FechaUltimaActualizacion,
        c.IdEstadoCaso, ec.NombreEstado AS NombreEstadoCaso,
        c.DetalleProgreso,
        c.IdFiscalAsignado,
        f_u.PrimerNombre AS FiscalPrimerNombre, f_u.PrimerApellido AS FiscalPrimerApellido, f_u.NombreUsuario AS FiscalNombreUsuario,
        f_fy.NombreFiscalia AS FiscalNombreFiscalia,
        uc.NombreUsuario AS UsuarioCreacionNombreUsuario,
        um.NombreUsuario AS UsuarioModificacionNombreUsuario
    FROM dbo.Casos c
    INNER JOIN dbo.EstadosCaso ec ON c.IdEstadoCaso = ec.IdEstadoCaso
    INNER JOIN dbo.Usuarios uc ON c.IdUsuarioCreacion = uc.IdUsuario
    INNER JOIN dbo.Usuarios um ON c.IdUsuarioUltimaModificacion = um.IdUsuario
    LEFT JOIN dbo.Fiscales f ON c.IdFiscalAsignado = f.IdFiscal
    LEFT JOIN dbo.Usuarios f_u ON f.IdUsuario = f_u.IdUsuario
    LEFT JOIN dbo.Fiscalias f_fy ON f.IdFiscalia = f_fy.IdFiscalia
    WHERE c.IdCaso = @IdCaso;
END
GO


PRINT 'Creando SP: sp_Caso_ListarPaginado...';
GO
CREATE PROCEDURE dbo.sp_Caso_ListarPaginado
    @Pagina INT = 1,
    @ResultadosPorPagina INT = 10,
    @IdEstadoCasoFiltro INT = NULL,
    @IdFiscalAsignadoFiltro INT = NULL,
    @TerminoBusqueda NVARCHAR(100) = NULL, -- Para buscar en NumeroCasoUnico o Descripcion
    @TotalResultados INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@Pagina - 1) * @ResultadosPorPagina;

    -- Contar total de resultados con filtros
    SELECT @TotalResultados = COUNT(*)
    FROM dbo.Casos c
    WHERE (@IdEstadoCasoFiltro IS NULL OR c.IdEstadoCaso = @IdEstadoCasoFiltro)
      AND (@IdFiscalAsignadoFiltro IS NULL OR c.IdFiscalAsignado = @IdFiscalAsignadoFiltro)
      AND (@TerminoBusqueda IS NULL OR c.NumeroCasoUnico LIKE '%' + @TerminoBusqueda + '%' OR c.Descripcion LIKE '%' + @TerminoBusqueda + '%');

    -- Obtener resultados paginados
    SELECT
        c.IdCaso, c.NumeroCasoUnico, c.Descripcion, c.FechaCreacion,
        ec.NombreEstado AS NombreEstadoCaso,
        f_u.PrimerNombre AS FiscalPrimerNombre, f_u.PrimerApellido AS FiscalPrimerApellido
    FROM dbo.Casos c
    INNER JOIN dbo.EstadosCaso ec ON c.IdEstadoCaso = ec.IdEstadoCaso
    LEFT JOIN dbo.Fiscales f ON c.IdFiscalAsignado = f.IdFiscal
    LEFT JOIN dbo.Usuarios f_u ON f.IdUsuario = f_u.IdUsuario
    WHERE (@IdEstadoCasoFiltro IS NULL OR c.IdEstadoCaso = @IdEstadoCasoFiltro)
      AND (@IdFiscalAsignadoFiltro IS NULL OR c.IdFiscalAsignado = @IdFiscalAsignadoFiltro)
      AND (@TerminoBusqueda IS NULL OR c.NumeroCasoUnico LIKE '%' + @TerminoBusqueda + '%' OR c.Descripcion LIKE '%' + @TerminoBusqueda + '%')
    ORDER BY c.FechaCreacion DESC
    OFFSET @Offset ROWS
    FETCH NEXT @ResultadosPorPagina ROWS ONLY;
END
GO

PRINT 'Creando SP: sp_Caso_ReasignarFiscalValidado...';
GO
CREATE PROCEDURE dbo.sp_Caso_ReasignarFiscalValidado
    @IdCaso INT,
    @IdNuevoFiscal INT,
    @IdUsuarioSolicitante INT,
    @Exito BIT OUTPUT,
    @Mensaje NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    DECLARE @IdFiscalAnterior INT;
    DECLARE @IdEstadoCasoActual INT;
    DECLARE @NombreEstadoPendiente NVARCHAR(50) = 'Pendiente'; -- Asumir que 'Pendiente' es el nombre del estado requerido
    DECLARE @IdEstadoPendiente INT;
    DECLARE @IdFiscaliaFiscalAnterior INT;
    DECLARE @IdFiscaliaNuevoFiscal INT;

    SET @Exito = 0;
    SET @Mensaje = '';

    BEGIN TRY
        -- Obtener estado pendiente ID
        SELECT @IdEstadoPendiente = IdEstadoCaso FROM dbo.EstadosCaso WHERE NombreEstado = @NombreEstadoPendiente;
        IF @IdEstadoPendiente IS NULL
        BEGIN
            SET @Mensaje = 'Configuración: El estado "Pendiente" no se encuentra definido.';
            RAISERROR(@Mensaje, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar existencia del caso y del nuevo fiscal
        IF NOT EXISTS (SELECT 1 FROM dbo.Casos WHERE IdCaso = @IdCaso)
        BEGIN SET @Mensaje = 'Caso no encontrado.'; RAISERROR(@Mensaje, 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Fiscales WHERE IdFiscal = @IdNuevoFiscal AND Activo = 1)
        BEGIN SET @Mensaje = 'Nuevo fiscal no encontrado o inactivo.'; RAISERROR(@Mensaje, 16, 1); ROLLBACK TRANSACTION; RETURN; END
        IF NOT EXISTS (SELECT 1 FROM dbo.Usuarios WHERE IdUsuario = @IdUsuarioSolicitante AND Activo = 1)
        BEGIN SET @Mensaje = 'Usuario solicitante no válido o inactivo.'; RAISERROR(@Mensaje, 16, 1); ROLLBACK TRANSACTION; RETURN; END

        -- Obtener información del caso y fiscal actual
        SELECT @IdFiscalAnterior = c.IdFiscalAsignado, @IdEstadoCasoActual = c.IdEstadoCaso
        FROM dbo.Casos c
        WHERE c.IdCaso = @IdCaso;

        -- 1. Validar que el estado del caso sea "Pendiente"
        IF @IdEstadoCasoActual <> @IdEstadoPendiente
        BEGIN
            SET @Mensaje = 'El caso no puede ser reasignado porque su estado no es "Pendiente". Estado actual ID: ' + CONVERT(NVARCHAR, @IdEstadoCasoActual);
            -- Registrar intento fallido
            EXEC dbo.sp_LogReasignacionFallida_Crear @IdCaso, @IdFiscalAnterior, @IdNuevoFiscal, @IdUsuarioSolicitante, @Mensaje;
            COMMIT TRANSACTION; -- Commit para guardar el log
            RETURN;
        END

        -- Obtener fiscalías
        SELECT @IdFiscaliaNuevoFiscal = IdFiscalia FROM dbo.Fiscales WHERE IdFiscal = @IdNuevoFiscal;

        IF @IdFiscalAnterior IS NOT NULL
        BEGIN
            SELECT @IdFiscaliaFiscalAnterior = IdFiscalia FROM dbo.Fiscales WHERE IdFiscal = @IdFiscalAnterior;

            -- 2. Validar que el nuevo fiscal pertenezca a la misma fiscalía que el fiscal anterior
            IF @IdFiscaliaFiscalAnterior <> @IdFiscaliaNuevoFiscal
            BEGIN
                SET @Mensaje = 'El caso no puede ser reasignado porque el nuevo fiscal no pertenece a la misma fiscalía que el fiscal anterior.';
                -- Registrar intento fallido
                EXEC dbo.sp_LogReasignacionFallida_Crear @IdCaso, @IdFiscalAnterior, @IdNuevoFiscal, @IdUsuarioSolicitante, @Mensaje;
                COMMIT TRANSACTION; -- Commit para guardar el log
                RETURN;
            END
        END
        -- Si no hay fiscal anterior (primera asignación), se permite.

        -- Si todas las validaciones pasan, reasignar
        UPDATE dbo.Casos
        SET IdFiscalAsignado = @IdNuevoFiscal,
            FechaUltimaActualizacion = GETUTCDATE(),
            IdUsuarioUltimaModificacion = @IdUsuarioSolicitante
        WHERE IdCaso = @IdCaso;

        SET @Exito = 1;
        SET @Mensaje = 'Caso reasignado exitosamente al fiscal ID: ' + CONVERT(NVARCHAR, @IdNuevoFiscal) + '.';
        COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Mensaje = ERROR_MESSAGE();
        -- Podrías registrar este error de CATCH también si es diferente a los logs de negocio
        THROW;
    END CATCH
END
GO

-------------------------------------------------------------------------------
-- LOGREASIGNACIONFALLIDA
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_LogReasignacionFallida_Crear...';
GO
CREATE PROCEDURE dbo.sp_LogReasignacionFallida_Crear
    @IdCaso INT,
    @IdFiscalAnterior INT = NULL,
    @IdFiscalDestinoIntentado INT,
    @IdUsuarioSolicitante INT,
    @MotivoFallo NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @IdFiscaliaFiscalAnterior_Snapshot INT = NULL;
    DECLARE @IdFiscaliaFiscalDestino_Snapshot INT;
    DECLARE @IdEstadoCasoAlMomento_Snapshot INT;

    -- Obtener snapshots de información relevante en el momento del fallo
    SELECT @IdEstadoCasoAlMomento_Snapshot = IdEstadoCaso FROM dbo.Casos WHERE IdCaso = @IdCaso;
    IF @IdFiscalAnterior IS NOT NULL
        SELECT @IdFiscaliaFiscalAnterior_Snapshot = IdFiscalia FROM dbo.Fiscales WHERE IdFiscal = @IdFiscalAnterior;
    SELECT @IdFiscaliaFiscalDestino_Snapshot = IdFiscalia FROM dbo.Fiscales WHERE IdFiscal = @IdFiscalDestinoIntentado;

    BEGIN TRY
        INSERT INTO dbo.LogReasignacionFallida (
            IdCaso, IdFiscalAnterior, IdFiscalDestinoIntentado,
            IdFiscaliaFiscalAnterior_Snapshot, IdFiscaliaFiscalDestino_Snapshot, IdEstadoCasoAlMomento_Snapshot,
            FechaIntento, IdUsuarioSolicitante, MotivoFallo
        ) VALUES (
            @IdCaso, @IdFiscalAnterior, @IdFiscalDestinoIntentado,
            @IdFiscaliaFiscalAnterior_Snapshot, @IdFiscaliaFiscalDestino_Snapshot, @IdEstadoCasoAlMomento_Snapshot,
            GETUTCDATE(), @IdUsuarioSolicitante, @MotivoFallo
        );
    END TRY
    BEGIN CATCH
        -- Aquí podrías loggear el error de inserción del log si falla,
        -- pero generalmente es un SP simple que no debería fallar si los FKs son correctos.
        THROW;
    END CATCH
END
GO

PRINT 'Creando SP: sp_LogReasignacionFallida_ListarPorCaso...';
GO
CREATE PROCEDURE dbo.sp_LogReasignacionFallida_ListarPorCaso
    @IdCaso INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        l.IdLog, l.FechaIntento, l.MotivoFallo,
        fa_u.NombreUsuario AS FiscalAnteriorNombreUsuario, fa.CodigoFiscal AS FiscalAnteriorCodigo,
        fd_u.NombreUsuario AS FiscalDestinoNombreUsuario, fd.CodigoFiscal AS FiscalDestinoCodigo,
        us.NombreUsuario AS UsuarioSolicitanteNombreUsuario,
        ec_snap.NombreEstado AS EstadoCasoAlMomento,
        fy_a_snap.NombreFiscalia AS FiscaliaAnteriorAlMomento,
        fy_d_snap.NombreFiscalia AS FiscaliaDestinoAlMomento
    FROM dbo.LogReasignacionFallida l
    LEFT JOIN dbo.Fiscales fa ON l.IdFiscalAnterior = fa.IdFiscal
    LEFT JOIN dbo.Usuarios fa_u ON fa.IdUsuario = fa_u.IdUsuario
    INNER JOIN dbo.Fiscales fd ON l.IdFiscalDestinoIntentado = fd.IdFiscal
    INNER JOIN dbo.Usuarios fd_u ON fd.IdUsuario = fd_u.IdUsuario
    INNER JOIN dbo.Usuarios us ON l.IdUsuarioSolicitante = us.IdUsuario
    LEFT JOIN dbo.EstadosCaso ec_snap ON l.IdEstadoCasoAlMomento_Snapshot = ec_snap.IdEstadoCaso
    LEFT JOIN dbo.Fiscalias fy_a_snap ON l.IdFiscaliaFiscalAnterior_Snapshot = fy_a_snap.IdFiscalia
    LEFT JOIN dbo.Fiscalias fy_d_snap ON l.IdFiscaliaFiscalDestino_Snapshot = fy_d_snap.IdFiscalia
    WHERE l.IdCaso = @IdCaso
    ORDER BY l.FechaIntento DESC;
END
GO

-------------------------------------------------------------------------------
-- INFORMES (Ejemplo)
-------------------------------------------------------------------------------
PRINT 'Creando SP: sp_Informe_CasosPorEstado...';
GO
CREATE PROCEDURE dbo.sp_Informe_CasosPorEstado
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        ec.NombreEstado,
        COUNT(c.IdCaso) AS TotalCasos
    FROM dbo.Casos c
    INNER JOIN dbo.EstadosCaso ec ON c.IdEstadoCaso = ec.IdEstadoCaso
    GROUP BY ec.NombreEstado
    ORDER BY TotalCasos DESC;
END
GO

PRINT 'Creando SP: sp_Informe_CasosPorFiscal...';
GO
CREATE PROCEDURE dbo.sp_Informe_CasosPorFiscal
    @IdFiscaliaFiltro INT = NULL -- Opcional para filtrar por fiscalía
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        CONCAT(u.PrimerNombre, ' ', u.PrimerApellido, ' (', f.CodigoFiscal, ')') AS NombreFiscalCompleto,
        fy.NombreFiscalia,
        COUNT(c.IdCaso) AS TotalCasosAsignados
    FROM dbo.Fiscales f
    INNER JOIN dbo.Usuarios u ON f.IdUsuario = u.IdUsuario
    INNER JOIN dbo.Fiscalias fy ON f.IdFiscalia = fy.IdFiscalia
    LEFT JOIN dbo.Casos c ON f.IdFiscal = c.IdFiscalAsignado
    WHERE f.Activo = 1 AND u.Activo = 1
      AND (@IdFiscaliaFiltro IS NULL OR f.IdFiscalia = @IdFiscaliaFiltro)
    GROUP BY u.PrimerNombre, u.PrimerApellido, f.CodigoFiscal, fy.NombreFiscalia
    ORDER BY TotalCasosAsignados DESC, NombreFiscalCompleto;
END
GO


PRINT '============================================================================';
PRINT 'Creación de Procedimientos Almacenados completada.';
PRINT '============================================================================';

-- Crear usuario para la aplicación
CREATE LOGIN AppUser WITH PASSWORD = 'admin1234';
GO

CREATE USER AppUser FOR LOGIN AppUser;
GO

-- Asignar permisos al usuario
ALTER ROLE db_owner ADD MEMBER AppUser;
GO

PRINT '============================================================================';
PRINT 'Creación de la estructura de la base de datos completada.';
PRINT '============================================================================';
GO
