const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const spExecutor = require('../dal/spExecutor');
const config = require('../config');
const sql = require('mssql');

class AuthService {
    
    /**
     * Registrar un nuevo usuario
     */
    async register(userData) {
        try {
            const { nombreUsuario, password, email, primerNombre, segundoNombre, primerApellido, segundoApellido } = userData;

            // Validar datos requeridos
            if (!nombreUsuario || !password || !email || !primerNombre || !primerApellido) {
                throw {
                    success: false,
                    message: 'Datos requeridos: nombreUsuario, password, email, primerNombre, primerApellido',
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

            // Encriptar la contraseña
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // Crear usuario usando procedimiento almacenado
            const result = await spExecutor.executeWithOutput(
                'sp_Usuario_Crear',
                {
                    NombreUsuario: nombreUsuario,
                    PasswordHash: passwordHash,
                    Email: email,
                    PrimerNombre: primerNombre,
                    SegundoNombre: segundoNombre || null,
                    PrimerApellido: primerApellido,
                    SegundoApellido: segundoApellido || null
                },
                [{ name: 'IdUsuario', type: sql.Int }]
            );

            const idUsuario = result.output.IdUsuario;

            return {
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    idUsuario,
                    nombreUsuario,
                    email,
                    primerNombre,
                    primerApellido
                }
            };

        } catch (error) {
            console.error('Error en register:', error);
            throw error;
        }
    }

    /**
     * Iniciar sesión
     */
    async login(nombreUsuario, password) {
        try {
            if (!nombreUsuario || !password) {
                throw {
                    success: false,
                    message: 'Nombre de usuario y contraseña son requeridos',
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

            // Obtener usuario por nombre de usuario
            const usuario = await spExecutor.executeScalar(
                'sp_Usuario_ObtenerPorNombreUsuario',
                { NombreUsuario: nombreUsuario }
            );

            if (!usuario) {
                throw {
                    success: false,
                    message: 'Credenciales inválidas',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 401
                };
            }

            if (!usuario.Activo) {
                throw {
                    success: false,
                    message: 'Usuario inactivo',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 401
                };
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, usuario.PasswordHash);
            if (!isValidPassword) {
                throw {
                    success: false,
                    message: 'Credenciales inválidas',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 401
                };
            }

            // Obtener roles y permisos del usuario
            const userRoles = await this.getUserRolesAndPermissions(usuario.IdUsuario);

            // Actualizar último login
            await spExecutor.execute('sp_Usuario_ActualizarUltimoLogin', {
                IdUsuario: usuario.IdUsuario
            });

            // Generar JWT
            const tokenPayload = {
                idUsuario: usuario.IdUsuario,
                nombreUsuario: usuario.NombreUsuario,
                email: usuario.Email,
                primerNombre: usuario.PrimerNombre,
                primerApellido: usuario.PrimerApellido,
                roles: userRoles.roles,
                permissions: userRoles.permissions
            };

            const token = jwt.sign(tokenPayload, config.JWT_SECRET, {
                expiresIn: config.JWT_EXPIRES_IN
            });

            return {
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    usuario: {
                        idUsuario: usuario.IdUsuario,
                        nombreUsuario: usuario.NombreUsuario,
                        email: usuario.Email,
                        primerNombre: usuario.PrimerNombre,
                        primerApellido: usuario.PrimerApellido,
                        roles: userRoles.roles,
                        permissions: userRoles.permissions
                    }
                }
            };

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    /**
     * Obtener roles y permisos de un usuario
     */
    async getUserRolesAndPermissions(idUsuario) {
        try {
            // Obtener roles del usuario
            const roles = await spExecutor.executeList(
                'sp_Usuario_ObtenerRoles',
                { IdUsuario: idUsuario }
            );

            // Obtener permisos del usuario
            const permisos = await spExecutor.executeList(
                'sp_Usuario_ObtenerPermisos',
                { IdUsuario: idUsuario }
            );

            return {
                roles: roles.map(r => r.NombreRol),
                permissions: permisos.map(p => p.ClavePermiso)
            };

        } catch (error) {
            console.error('Error obteniendo roles y permisos:', error);
            return { roles: [], permissions: [] };
        }
    }

    /**
     * Refrescar token
     */
    async refreshToken(token) {
        try {
            // Verificar token actual (permitir tokens expirados para refresh)
            const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });

            // Verificar que el usuario siga activo
            const usuario = await spExecutor.executeScalar(
                'sp_Usuario_ObtenerPorId',
                { IdUsuario: decoded.idUsuario }
            );

            if (!usuario || !usuario.Activo) {
                throw {
                    success: false,
                    message: 'Usuario no encontrado o inactivo',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 401
                };
            }

            // Obtener roles y permisos actualizados
            const userRoles = await this.getUserRolesAndPermissions(usuario.IdUsuario);

            // Generar nuevo token
            const newTokenPayload = {
                idUsuario: usuario.IdUsuario,
                nombreUsuario: usuario.NombreUsuario,
                email: usuario.Email,
                primerNombre: usuario.PrimerNombre,
                primerApellido: usuario.PrimerApellido,
                roles: userRoles.roles,
                permissions: userRoles.permissions
            };

            const newToken = jwt.sign(newTokenPayload, config.JWT_SECRET, {
                expiresIn: config.JWT_EXPIRES_IN
            });

            return {
                success: true,
                message: 'Token renovado exitosamente',
                data: {
                    token: newToken,
                    usuario: newTokenPayload
                }
            };

        } catch (error) {
            console.error('Error renovando token:', error);
            if (error.name === 'JsonWebTokenError') {
                throw {
                    success: false,
                    message: 'Token inválido',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 401
                };
            }
            throw error;
        }
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(idUsuario, currentPassword, newPassword) {
        try {
            // Obtener usuario actual
            const usuario = await spExecutor.executeScalar(
                'sp_Usuario_ObtenerPorId',
                { IdUsuario: idUsuario }
            );

            console.log('🔍 Usuario obtenido para cambio de contraseña:', usuario);

            if (!usuario) {
                throw {
                    success: false,
                    message: 'Usuario no encontrado',
                    code: config.ERROR_CODES.NOT_FOUND,
                    statusCode: 404
                };
            }

            // Verificar que tenemos el hash de la contraseña
            if (!usuario.PasswordHash) {
                console.error('❌ PasswordHash no encontrado en usuario:', Object.keys(usuario));
                throw {
                    success: false,
                    message: 'Error interno: datos de usuario incompletos',
                    code: config.ERROR_CODES.DATABASE_ERROR,
                    statusCode: 500
                };
            }

            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, usuario.PasswordHash);
            if (!isValidPassword) {
                throw {
                    success: false,
                    message: 'Contraseña actual incorrecta',
                    code: config.ERROR_CODES.AUTHENTICATION_ERROR,
                    statusCode: 400
                };
            }

            // Encriptar nueva contraseña
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Actualizar contraseña
            await spExecutor.execute('sp_Usuario_ActualizarPassword', {
                IdUsuario: idUsuario,
                NuevoPasswordHash: newPasswordHash
            });

            return {
                success: true,
                message: 'Contraseña actualizada exitosamente'
            };

        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    }
}

module.exports = new AuthService();
