const jwt = require('jsonwebtoken');
const config = require('../config');

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido',
                code: config.ERROR_CODES.AUTHENTICATION_ERROR
            });
        }

        // Verificar el formato: "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido',
                code: config.ERROR_CODES.AUTHENTICATION_ERROR
            });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Agregar la información del usuario a la request
        req.user = decoded;
        
        next();
    } catch (error) {
        console.error('Error en autenticación:', error.message);
        
        let message = 'Token inválido';
        if (error.name === 'TokenExpiredError') {
            message = 'Token expirado';
        } else if (error.name === 'JsonWebTokenError') {
            message = 'Token malformado';
        }

        return res.status(401).json({
            success: false,
            message,
            code: config.ERROR_CODES.AUTHENTICATION_ERROR
        });
    }
};

/**
 * Middleware para verificar permisos específicos
 * @param {string|Array} requiredPermissions - Permiso(s) requerido(s)
 */
const requirePermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            const userPermissions = req.user.permissions || [];
            const permissions = Array.isArray(requiredPermissions) 
                ? requiredPermissions 
                : [requiredPermissions];

            // Verificar si el usuario tiene al menos uno de los permisos requeridos
            const hasPermission = permissions.some(permission => 
                userPermissions.includes(permission)
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: 'Permisos insuficientes para realizar esta acción',
                    code: config.ERROR_CODES.AUTHORIZATION_ERROR
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando permisos:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                code: config.ERROR_CODES.INTERNAL_ERROR
            });
        }
    };
};

/**
 * Middleware para verificar roles específicos
 * @param {string|Array} requiredRoles - Rol(es) requerido(s)
 */
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const userRoles = req.user.roles || [];
            const roles = Array.isArray(requiredRoles) 
                ? requiredRoles 
                : [requiredRoles];

            // Verificar si el usuario tiene al menos uno de los roles requeridos
            const hasRole = roles.some(role => 
                userRoles.includes(role)
            );

            if (!hasRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Rol insuficiente para realizar esta acción',
                    code: config.ERROR_CODES.AUTHORIZATION_ERROR
                });
            }

            next();
        } catch (error) {
            console.error('Error verificando roles:', error.message);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                code: config.ERROR_CODES.INTERNAL_ERROR
            });
        }
    };
};

module.exports = {
    authMiddleware,
    requirePermission,
    requireRole
};
