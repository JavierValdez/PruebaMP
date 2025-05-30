const config = require('../config');

const errorHandler = (err, req, res, next) => {
    console.error('Error capturado por errorHandler:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });

    // Error personalizado de la aplicación
    if (err.success === false) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Error interno del servidor',
            code: err.code || config.ERROR_CODES.INTERNAL_ERROR,
            ...(config.NODE_ENV === 'development' && { details: err.originalError })
        });
    }

    // Error de validación de JWT
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticación inválido',
            code: config.ERROR_CODES.AUTHENTICATION_ERROR
        });
    }

    // Error de validación de datos
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            code: config.ERROR_CODES.VALIDATION_ERROR,
            details: err.details || err.message
        });
    }

    // Error de base de datos
    if (err.code && (err.code.toString().startsWith('E') || err.code.toString().startsWith('2'))) {
        return res.status(500).json({
            success: false,
            message: 'Error en la base de datos',
            code: config.ERROR_CODES.DATABASE_ERROR,
            ...(config.NODE_ENV === 'development' && { details: err.message })
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        code: config.ERROR_CODES.INTERNAL_ERROR,
        ...(config.NODE_ENV === 'development' && { 
            stack: err.stack,
            originalError: err
        })
    });
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.url}`,
        code: config.ERROR_CODES.NOT_FOUND
    });
};

/**
 * Wrapper para funciones async para capturar errores automáticamente
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
