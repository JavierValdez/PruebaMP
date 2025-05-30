const spExecutor = require('../dal/spExecutor');
const config = require('../config');

class InformeService {

    /**
     * Obtener estadísticas generales del sistema
     */
    async obtenerEstadisticasGenerales() {
        try {
            // Obtener conteos por estado
            const casosPorEstado = await spExecutor.executeList('sp_Informe_CasosPorEstado');
            
            // Obtener conteos por fiscal
            const casosPorFiscal = await spExecutor.executeList('sp_Informe_CasosPorFiscal');
            
            // Calcular estadísticas adicionales
            const totalCasos = casosPorEstado.reduce((sum, estado) => sum + estado.TotalCasos, 0);
            
            const fiscalesActivos = casosPorFiscal.length;
            const promedioCaracteristicas = fiscalesActivos > 0 ? totalCasos / fiscalesActivos : 0;

            return {
                success: true,
                data: {
                    resumen: {
                        totalCasos,
                        fiscalesActivos,
                        promedioCasosPorFiscal: Math.round(promedioCaracteristicas * 100) / 100
                    },
                    casosPorEstado,
                    casosPorFiscal
                }
            };

        } catch (error) {
            console.error('Error en obtenerEstadisticasGenerales:', error);
            throw {
                success: false,
                message: 'Error al obtener estadísticas generales',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener informe de casos por estado
     */
    async obtenerInformeCasosPorEstado() {
        try {
            const datos = await spExecutor.executeList('sp_Informe_CasosPorEstado');

            return {
                success: true,
                data: {
                    titulo: 'Informe de Casos por Estado',
                    fechaGeneracion: new Date().toISOString(),
                    casos: datos
                }
            };

        } catch (error) {
            console.error('Error en obtenerInformeCasosPorEstado:', error);
            throw {
                success: false,
                message: 'Error al generar informe de casos por estado',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener informe de casos por fiscal
     */
    async obtenerInformeCasosPorFiscal(idFiscaliaFiltro = null) {
        try {
            const datos = await spExecutor.executeList('sp_Informe_CasosPorFiscal', {
                IdFiscaliaFiltro: idFiscaliaFiltro
            });

            return {
                success: true,
                data: {
                    titulo: 'Informe de Casos por Fiscal',
                    fechaGeneracion: new Date().toISOString(),
                    filtroFiscalia: idFiscaliaFiltro,
                    fiscales: datos
                }
            };

        } catch (error) {
            console.error('Error en obtenerInformeCasosPorFiscal:', error);
            throw {
                success: false,
                message: 'Error al generar informe de casos por fiscal',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener informe de productividad por fiscalía
     */
    async obtenerInformeProductividadPorFiscalia() {
        try {
            // Usar procedimiento existente con agrupación por fiscalía
            const datosFiscales = await spExecutor.executeList('sp_Informe_CasosPorFiscal');
            
            // Agrupar por fiscalía
            const productividadPorFiscalia = {};
            
            datosFiscales.forEach(fiscal => {
                const fiscalia = fiscal.NombreFiscalia;
                
                if (!productividadPorFiscalia[fiscalia]) {
                    productividadPorFiscalia[fiscalia] = {
                        nombreFiscalia: fiscalia,
                        totalCasos: 0,
                        totalFiscales: 0,
                        fiscales: []
                    };
                }
                
                productividadPorFiscalia[fiscalia].totalCasos += fiscal.TotalCasosAsignados;
                productividadPorFiscalia[fiscalia].totalFiscales += 1;
                productividadPorFiscalia[fiscalia].fiscales.push({
                    nombre: fiscal.NombreFiscalCompleto,
                    casos: fiscal.TotalCasosAsignados
                });
            });

            // Convertir a array y calcular promedios
            const resultado = Object.values(productividadPorFiscalia).map(fiscalia => ({
                ...fiscalia,
                promedioCasosPorFiscal: fiscalia.totalFiscales > 0 
                    ? Math.round((fiscalia.totalCasos / fiscalia.totalFiscales) * 100) / 100 
                    : 0
            }));

            return {
                success: true,
                data: {
                    titulo: 'Informe de Productividad por Fiscalía',
                    fechaGeneracion: new Date().toISOString(),
                    fiscalias: resultado
                }
            };

        } catch (error) {
            console.error('Error en obtenerInformeProductividadPorFiscalia:', error);
            throw {
                success: false,
                message: 'Error al generar informe de productividad por fiscalía',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener informe de intentos de reasignación fallidos
     */
    async obtenerInformeReasignacionesFallidas(fechaInicio = null, fechaFin = null) {
        try {
            // Por ahora usar una consulta directa ya que no hay SP específico
            const query = `
                SELECT 
                    l.IdLog,
                    l.FechaIntento,
                    c.NumeroCasoUnico,
                    c.Descripcion as DescripcionCaso,
                    CONCAT(uAnt.PrimerNombre, ' ', uAnt.PrimerApellido) as FiscalAnterior,
                    CONCAT(uDest.PrimerNombre, ' ', uDest.PrimerApellido) as FiscalDestinoIntentado,
                    l.MotivoFallo,
                    CONCAT(uSol.PrimerNombre, ' ', uSol.PrimerApellido) as UsuarioSolicitante
                FROM dbo.LogReasignacionFallida l
                INNER JOIN dbo.Casos c ON l.IdCaso = c.IdCaso
                LEFT JOIN dbo.Fiscales fAnt ON l.IdFiscalAnterior = fAnt.IdFiscal
                LEFT JOIN dbo.Usuarios uAnt ON fAnt.IdUsuario = uAnt.IdUsuario
                INNER JOIN dbo.Fiscales fDest ON l.IdFiscalDestinoIntentado = fDest.IdFiscal
                INNER JOIN dbo.Usuarios uDest ON fDest.IdUsuario = uDest.IdUsuario
                INNER JOIN dbo.Usuarios uSol ON l.IdUsuarioSolicitante = uSol.IdUsuario
                WHERE (@FechaInicio IS NULL OR l.FechaIntento >= @FechaInicio)
                  AND (@FechaFin IS NULL OR l.FechaIntento <= @FechaFin)
                ORDER BY l.FechaIntento DESC
            `;

            const datos = await spExecutor.executeQuery(query, {
                FechaInicio: fechaInicio,
                FechaFin: fechaFin
            });

            return {
                success: true,
                data: {
                    titulo: 'Informe de Reasignaciones Fallidas',
                    fechaGeneracion: new Date().toISOString(),
                    periodo: {
                        fechaInicio: fechaInicio,
                        fechaFin: fechaFin
                    },
                    totalIntentos: datos.length,
                    intentosFallidos: datos
                }
            };

        } catch (error) {
            console.error('Error en obtenerInformeReasignacionesFallidas:', error);
            throw {
                success: false,
                message: 'Error al generar informe de reasignaciones fallidas',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener dashboard con métricas clave
     */
    async obtenerDashboard() {
        try {
            // Obtener estadísticas generales
            const estadisticas = await this.obtenerEstadisticasGenerales();
            
            // Obtener métricas adicionales
            const metricas = await this.obtenerMetricasAdicionales();

            return {
                success: true,
                data: {
                    titulo: 'Dashboard - Ministerio Público',
                    fechaActualizacion: new Date().toISOString(),
                    estadisticasGenerales: estadisticas.data,
                    metricas: metricas.data
                }
            };

        } catch (error) {
            console.error('Error en obtenerDashboard:', error);
            throw {
                success: false,
                message: 'Error al generar dashboard',
                code: config.ERROR_CODES.INTERNAL_ERROR,
                statusCode: 500
            };
        }
    }

    /**
     * Obtener métricas adicionales para el dashboard
     */
    async obtenerMetricasAdicionales() {
        try {
            const query = `
                SELECT 
                    'casos_nuevos_mes' as metrica,
                    COUNT(*) as valor
                FROM dbo.Casos 
                WHERE FechaCreacion >= DATEADD(month, -1, GETDATE())
                
                UNION ALL
                
                SELECT 
                    'casos_cerrados_mes' as metrica,
                    COUNT(*) as valor
                FROM dbo.Casos c
                INNER JOIN dbo.EstadosCaso e ON c.IdEstadoCaso = e.IdEstadoCaso
                WHERE e.NombreEstado = 'Cerrado' 
                  AND c.FechaUltimaActualizacion >= DATEADD(month, -1, GETDATE())
                
                UNION ALL
                
                SELECT 
                    'casos_pendientes' as metrica,
                    COUNT(*) as valor
                FROM dbo.Casos c
                INNER JOIN dbo.EstadosCaso e ON c.IdEstadoCaso = e.IdEstadoCaso
                WHERE e.NombreEstado = 'Pendiente'
                
                UNION ALL
                
                SELECT 
                    'intentos_reasignacion_fallidos_mes' as metrica,
                    COUNT(*) as valor
                FROM dbo.LogReasignacionFallida
                WHERE FechaIntento >= DATEADD(month, -1, GETDATE())
            `;

            const datos = await spExecutor.executeQuery(query);
            
            // Convertir a objeto para fácil acceso
            const metricas = {};
            datos.forEach(item => {
                metricas[item.metrica] = item.valor;
            });

            return {
                success: true,
                data: {
                    casosNuevosEsteMes: metricas.casos_nuevos_mes || 0,
                    casosCerradosEsteMes: metricas.casos_cerrados_mes || 0,
                    casosPendientes: metricas.casos_pendientes || 0,
                    intentosReasignacionFallidosEsteMes: metricas.intentos_reasignacion_fallidos_mes || 0
                }
            };

        } catch (error) {
            console.error('Error en obtenerMetricasAdicionales:', error);
            throw error;
        }
    }
}

module.exports = new InformeService();
