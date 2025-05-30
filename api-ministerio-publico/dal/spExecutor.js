const sql = require('mssql');
const dbConfig = require('../config/db');

class SPExecutor {
    
    /**
     * Ejecuta un procedimiento almacenado
     * @param {string} spName - Nombre del procedimiento almacenado
     * @param {Object} parameters - Parámetros del SP
     * @param {Array} outputParams - Parámetros de salida [{ name: 'param', type: sql.Int }]
     * @returns {Promise<Object>} - Resultado del SP
     */
    async execute(spName, parameters = {}, outputParams = []) {
        try {
            const pool = await dbConfig.getPool(); // Ahora es async
            const request = pool.request();

            // Agregar parámetros de entrada
            for (const [key, value] of Object.entries(parameters)) {
                if (value !== undefined && value !== null) {
                    request.input(key, value);
                } else {
                    request.input(key, sql.NVarChar, null);
                }
            }

            // Agregar parámetros de salida
            outputParams.forEach(param => {
                request.output(param.name, param.type);
            });

            console.log(`🔍 Ejecutando SP: ${spName}`, parameters);
            const result = await request.execute(spName);

            return {
                success: true,
                recordsets: result.recordsets,
                recordset: result.recordset,
                output: result.output,
                rowsAffected: result.rowsAffected
            };

        } catch (error) {
            console.error(`❌ Error ejecutando SP ${spName}:`, error.message);
            throw {
                success: false,
                error: error.message,
                code: error.code || 'DATABASE_ERROR',
                originalError: error
            };
        }
    }

    /**
     * Ejecuta una consulta SQL directa (usar con precaución)
     * @param {string} query - Consulta SQL
     * @param {Object} parameters - Parámetros de la consulta
     * @returns {Promise<Object>} - Resultado de la consulta
     */
    async query(query, parameters = {}) {
        try {
            const pool = await dbConfig.getPool(); // Ahora es async
            const request = pool.request();

            // Agregar parámetros
            for (const [key, value] of Object.entries(parameters)) {
                request.input(key, value);
            }

            console.log(`🔍 Ejecutando consulta:`, query);
            const result = await request.query(query);

            return {
                success: true,
                recordsets: result.recordsets,
                recordset: result.recordset,
                rowsAffected: result.rowsAffected
            };

        } catch (error) {
            console.error(`❌ Error ejecutando consulta:`, error.message);
            throw {
                success: false,
                error: error.message,
                code: error.code || 'DATABASE_ERROR',
                originalError: error
            };
        }
    }

    /**
     * Ejecuta un procedimiento almacenado que devuelve un solo registro
     * @param {string} spName - Nombre del procedimiento almacenado
     * @param {Object} parameters - Parámetros del SP
     * @returns {Promise<Object|null>} - Primer registro o null
     */
    async executeScalar(spName, parameters = {}) {
        const result = await this.execute(spName, parameters);
        
        if (result.recordset && result.recordset.length > 0) {
            return result.recordset[0];
        }
        
        return null;
    }

    /**
     * Ejecuta un procedimiento almacenado que devuelve múltiples registros
     * @param {string} spName - Nombre del procedimiento almacenado
     * @param {Object} parameters - Parámetros del SP
     * @returns {Promise<Array>} - Array de registros
     */
    async executeList(spName, parameters = {}) {
        const result = await this.execute(spName, parameters);
        return result.recordset || [];
    }

    /**
     * Ejecuta un procedimiento almacenado con parámetros de salida
     * @param {string} spName - Nombre del procedimiento almacenado
     * @param {Object} parameters - Parámetros del SP
     * @param {Array} outputParams - Parámetros de salida
     * @returns {Promise<Object>} - Resultado con outputs
     */
    async executeWithOutput(spName, parameters = {}, outputParams = []) {
        const result = await this.execute(spName, parameters, outputParams);
        return {
            data: result.recordset,
            output: result.output
        };
    }
}

module.exports = new SPExecutor();
