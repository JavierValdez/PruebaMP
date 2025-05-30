const sql = require('mssql');
const fs = require('fs');
const path = require('path');

class DatabaseConfig {
    constructor() {
        this.config = {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            port: parseInt(process.env.DB_PORT) || 1433,
            options: {
                encrypt: false, // Para conexiones locales
                trustServerCertificate: true,
                enableArithAbort: true,
                requestTimeout: 30000,
                connectionTimeout: 30000
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        };
        this.pool = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            // Cerrar conexión existente si existe
            if (this.pool) {
                try {
                    await this.pool.close();
                } catch (e) {
                    console.log('⚠️  Error cerrando pool anterior:', e.message);
                }
            }

            // Asegurar que la base de datos existe
            await this.ensureDatabaseExists();

            console.log('Iniciando conexión a la base de datos...');
            console.log(`🔗 Conectando a: ${this.config.database}@${this.config.server}`);
            
            this.pool = await sql.connect(this.config);
            
            // Configurar manejo de errores del pool
            this.pool.on('error', (err) => {
                console.error('❌ Error en el pool de conexiones:', err);
                this.isInitialized = false;
            });
            
            // Ejecutar el script setup.sql si existe
            await this.executeSetupScript();
            
            this.isInitialized = true;
            console.log('✅ Conexión a la base de datos establecida exitosamente');
            console.log(`📊 Base de datos activa: ${this.config.database}`);
        } catch (error) {
            console.error('❌ Error al conectar con la base de datos:', error.message);
            this.isInitialized = false;
            throw error;
        }
    }

    async executeSetupScript() {
        try {
            // Buscar el script setup.sql en el directorio padre
            const setupScriptPath = path.join(__dirname, '../sql/setup.sql');
            const additionalScriptPath = path.join(__dirname, '../sql/datos-iniciales.sql');
            
            // Ejecutar script principal
            if (fs.existsSync(setupScriptPath)) {
                console.log('Ejecutando script principal de configuración de la base de datos...');
                await this.executeScript(setupScriptPath);
                console.log('✅ Script principal ejecutado exitosamente');
            } else {
                console.log('ℹ️  No se encontró script setup.sql principal, continuando...');
            }

            // Ejecutar script adicional con datos iniciales
            if (fs.existsSync(additionalScriptPath)) {
                console.log('Ejecutando script de datos iniciales...');
                await this.executeScript(additionalScriptPath);
                console.log('✅ Script de datos iniciales ejecutado exitosamente');
            } else {
                console.log('ℹ️  No se encontró script de datos iniciales, continuando...');
            }
        } catch (error) {
            console.error('❌ Error al ejecutar scripts de configuración:', error.message);
            // No lanzamos el error para permitir que la aplicación continúe
        }
    }

    async executeScript(scriptPath) {
        const setupScript = fs.readFileSync(scriptPath, 'utf8');
        
        // Dividir el script en comandos individuales por GO
        const commands = setupScript
            .split(/\r?\nGO\r?\n|\r?\nGO$/gim)
            .filter(cmd => cmd.trim().length > 0)
            .map(cmd => cmd.trim());

        for (const command of commands) {
            if (command.length > 0) {
                try {
                    await this.pool.request().query(command);
                } catch (error) {
                    // Ignorar errores de objetos que ya existen
                    if (!error.message.includes('already exists') && 
                        !error.message.includes('ya existe') &&
                        !error.message.includes('Cannot drop the database') &&
                        !error.message.includes('duplicate key')) {
                        console.warn('Warning en comando SQL:', error.message);
                    }
                }
            }
        }
    }

    async getPool() {
        // Verificar si la conexión está activa, si no, reinicializar
        if (!this.pool || !this.pool.connected) {
            console.log('🔄 Pool de conexión no disponible, reinicializando...');
            await this.initialize();
        }
        
        // Verificar la conexión con una consulta simple
        try {
            await this.pool.request().query('SELECT 1 as test');
        } catch (error) {
            console.log('🔄 Conexión perdida, reconectando...');
            await this.initialize();
        }
        
        return this.pool;
    }

    async close() {
        if (this.pool) {
            await this.pool.close();
            this.isInitialized = false;
            console.log('🔒 Conexión a la base de datos cerrada');
        }
    }

    async ensureDatabaseExists() {
        try {
            // Primero conectar a master para verificar/crear la base de datos
            const masterConfig = { ...this.config, database: 'master' };
            const masterPool = await sql.connect(masterConfig);
            
            // Verificar si la base de datos existe
            const checkDb = await masterPool.request()
                .query(`SELECT name FROM sys.databases WHERE name = '${this.config.database}'`);
            
            if (checkDb.recordset.length === 0) {
                console.log(`📋 Creando base de datos ${this.config.database}...`);
                await masterPool.request()
                    .query(`CREATE DATABASE [${this.config.database}]`);
                console.log(`✅ Base de datos ${this.config.database} creada exitosamente`);
            } else {
                console.log(`📋 Base de datos ${this.config.database} ya existe`);
            }
            
            await masterPool.close();
        } catch (error) {
            console.error('❌ Error verificando/creando base de datos:', error.message);
            // No lanzar error, intentar continuar
        }
    }
}

module.exports = new DatabaseConfig();
