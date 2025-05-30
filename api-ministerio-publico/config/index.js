module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'default_secret_key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    
    // Configuración de paginación
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    
    // Configuración de errores
    ERROR_CODES: {
        VALIDATION_ERROR: 'VALIDATION_ERROR',
        AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
        AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
        NOT_FOUND: 'NOT_FOUND',
        DATABASE_ERROR: 'DATABASE_ERROR',
        INTERNAL_ERROR: 'INTERNAL_ERROR'
    }
};
