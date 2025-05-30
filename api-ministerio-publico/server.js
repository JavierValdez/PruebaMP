require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dbConfig = require('./config/db');
const config = require('./config');

// Importar middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const casoRoutes = require('./routes/casoRoutes');

class Server {
    constructor() {
        this.app = express();
        this.port = config.PORT;
        
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        // CORS
        this.app.use(cors({
            origin: config.CORS_ORIGIN,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        // Body parsing middleware
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Request logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'API del Ministerio Público funcionando correctamente',
                timestamp: new Date().toISOString(),
                environment: config.NODE_ENV,
                version: '1.0.0'
            });
        });
    }

    initializeRoutes() {
        // Rutas principales
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/casos', casoRoutes);

        // Ruta raíz con información de la API
        this.app.get('/', (req, res) => {
            res.json({
                success: true,
                message: 'API del Sistema de Gestión de Casos - Ministerio Público',
                version: '1.0.0',
                documentation: '/api/docs',
                health: '/health',
                endpoints: {
                    auth: '/api/auth',
                    casos: '/api/casos'
                }
            });
        });

        // Documentación básica de la API
        this.app.get('/api/docs', (req, res) => {
            res.json({
                title: 'API del Sistema de Gestión de Casos - Ministerio Público',
                version: '1.0.0',
                description: 'API REST para la gestión de casos del Ministerio Público',
                endpoints: {
                    authentication: {
                        base: '/api/auth',
                        routes: [
                            'POST /register - Registrar usuario',
                            'POST /login - Iniciar sesión',
                            'POST /refresh - Refrescar token',
                            'GET /verify - Verificar token',
                            'GET /profile - Obtener perfil',
                            'POST /change-password - Cambiar contraseña',
                            'POST /logout - Cerrar sesión'
                        ]
                    },
                    casos: {
                        base: '/api/casos',
                        routes: [
                            'GET / - Listar casos (con paginación y filtros)',
                            'POST / - Crear caso',
                            'GET /:id - Obtener caso por ID',
                            'PUT /:id - Actualizar caso',
                            'GET /estados - Obtener estados de caso',
                            'GET /fiscales - Obtener fiscales activos',
                            'GET /buscar - Buscar casos',
                            'GET /mis-casos - Mis casos asignados',
                            'GET /fiscal/:idFiscal - Casos por fiscal',
                            'GET /estado/:idEstado - Casos por estado',
                            'POST /:id/asignar-fiscal - Asignar fiscal',
                            'POST /:id/reasignar-fiscal - Reasignar fiscal'
                        ]
                    }
                },
                authentication: 'Bearer Token (JWT)',
                contentType: 'application/json'
            });
        });
    }

    initializeErrorHandling() {
        // Middleware para rutas no encontradas
        this.app.use(notFoundHandler);

        // Middleware global de manejo de errores
        this.app.use(errorHandler);
    }

    async start() {
        try {
            // Inicializar base de datos
            console.log('🔄 Inicializando base de datos...');
            await dbConfig.initialize();

            // Iniciar servidor
            this.app.listen(this.port, () => {
                console.log('🚀 =====================================================');
                console.log('🚀 API del Ministerio Público iniciada exitosamente');
                console.log('🚀 =====================================================');
                console.log(`🌐 Servidor corriendo en puerto: ${this.port}`);
                console.log(`🌐 URL: http://localhost:${this.port}`);
                console.log(`📋 Health Check: http://localhost:${this.port}/health`);
                console.log(`📋 Documentación: http://localhost:${this.port}/api/docs`);
                console.log(`🔐 Base de datos: ${process.env.DB_DATABASE}@${process.env.DB_SERVER}`);
                console.log(`🌍 Entorno: ${config.NODE_ENV}`);
                console.log('🚀 =====================================================');
            });

        } catch (error) {
            console.error('❌ Error al iniciar el servidor:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            console.log('🔄 Cerrando servidor...');
            await dbConfig.close();
            console.log('✅ Servidor cerrado correctamente');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error al cerrar el servidor:', error);
            process.exit(1);
        }
    }
}

// Manejar señales de cierre
const server = new Server();

process.on('SIGTERM', () => {
    console.log('📨 Señal SIGTERM recibida');
    server.stop();
});

process.on('SIGINT', () => {
    console.log('📨 Señal SIGINT recibida (Ctrl+C)');
    server.stop();
});

process.on('uncaughtException', (error) => {
    console.error('❌ Excepción no capturada:', error);
    server.stop();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada en:', promise, 'razón:', reason);
    server.stop();
});

// Iniciar el servidor
server.start();

module.exports = server;
