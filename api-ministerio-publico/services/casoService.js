const spExecutor = require('../dal/spExecutor');
const config = require('../config');
const sql = require('mssql');

class CasoService {

    /**
     * Crear un nuevo caso
     */
    async crearCaso(casoData, idUsuarioCreacion) {
        try {
            const { numeroCasoUnico, descripcion, idEstadoCaso, detalleProgreso, idFiscalAsignado } = casoData;

            // Validar datos requeridos
            if (!numeroCasoUnico || !descripcion || !idEstadoCaso) {
                throw {
                    success: false,
                    message: 'Datos requeridos: numeroCasoUnico, descripcion, idEstadoCaso',
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

            const result = await spExecutor.executeWithOutput(
                'sp_Caso_Crear',
                {
                    NumeroCasoUnico: numeroCasoUnico,
                    Descripcion: descripcion,
                    IdEstadoCaso: idEstadoCaso,
                    DetalleProgreso: detalleProgreso || null,
                    IdFiscalAsignado: idFiscalAsignado || null,
                    IdUsuarioCreacion: idUsuarioCreacion
                },
                [{ name: 'IdCasoCreado', type: sql.Int }]
            );

            return {
                success: true,
                message: 'Caso creado exitosamente',
                data: {
                    idCaso: result.output.IdCasoCreado,
                    numeroCasoUnico,
                    descripcion
                }
            };

        } catch (error) {
            console.error('Error en crearCaso:', error);
            throw error;
        }
    }

    /**
     * Obtener caso por ID
     */
    async obtenerCasoPorId(idCaso) {
        try {
            const caso = await spExecutor.executeScalar('sp_Caso_ObtenerPorId', {
                IdCaso: idCaso
            });

            if (!caso) {
                throw {
                    success: false,
                    message: 'Caso no encontrado',
                    code: config.ERROR_CODES.NOT_FOUND,
                    statusCode: 404
                };
            }

            return {
                success: true,
                data: caso
            };

        } catch (error) {
            console.error('Error en obtenerCasoPorId:', error);
            throw error;
        }
    }

    /**
     * Listar casos con paginación
     */
    async listarCasos(filtros = {}) {
        try {
            const {
                pagina = 1,
                resultadosPorPagina = config.DEFAULT_PAGE_SIZE,
                idEstadoCasoFiltro = null,
                idFiscalAsignadoFiltro = null,
                terminoBusqueda = null
            } = filtros;

            // Validar parámetros de paginación
            if (resultadosPorPagina > config.MAX_PAGE_SIZE) {
                throw {
                    success: false,
                    message: `Máximo ${config.MAX_PAGE_SIZE} resultados por página`,
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

            const result = await spExecutor.executeWithOutput(
                'sp_Caso_ListarPaginado',
                {
                    Pagina: pagina,
                    ResultadosPorPagina: resultadosPorPagina,
                    IdEstadoCasoFiltro: idEstadoCasoFiltro,
                    IdFiscalAsignadoFiltro: idFiscalAsignadoFiltro,
                    TerminoBusqueda: terminoBusqueda
                },
                [{ name: 'TotalResultados', type: sql.Int }]
            );

            return {
                success: true,
                data: {
                    casos: result.data || [],
                    paginacion: {
                        paginaActual: pagina,
                        resultadosPorPagina,
                        totalResultados: result.output.TotalResultados,
                        totalPaginas: Math.ceil(result.output.TotalResultados / resultadosPorPagina)
                    }
                }
            };

        } catch (error) {
            console.error('Error en listarCasos:', error);
            throw error;
        }
    }

    /**
     * Actualizar caso
     */
    async actualizarCaso(idCaso, casoData, idUsuarioModificacion) {
        try {
            const { descripcion, idEstadoCaso, detalleProgreso } = casoData;

            // Validar datos requeridos
            if (!descripcion || !idEstadoCaso) {
                throw {
                    success: false,
                    message: 'Datos requeridos: descripcion, idEstadoCaso',
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

            await spExecutor.execute('sp_Caso_Actualizar', {
                IdCaso: idCaso,
                Descripcion: descripcion,
                IdEstadoCaso: idEstadoCaso,
                DetalleProgreso: detalleProgreso || null,
                IdUsuarioModificacion: idUsuarioModificacion
            });

            return {
                success: true,
                message: 'Caso actualizado exitosamente'
            };

        } catch (error) {
            console.error('Error en actualizarCaso:', error);
            throw error;
        }
    }

    /**
     * Obtener estados de caso
     */
    async obtenerEstadosCaso() {
        try {
            const estados = await spExecutor.executeList('sp_EstadoCaso_ListarTodos');

            return {
                success: true,
                data: estados
            };

        } catch (error) {
            console.error('Error en obtenerEstadosCaso:', error);
            throw error;
        }
    }

    /**
     * Obtener fiscales activos
     */
    async obtenerFiscalesActivos() {
        try {
            const fiscales = await spExecutor.executeList('sp_Fiscal_ListarTodosActivos');

            return {
                success: true,
                data: fiscales
            };

        } catch (error) {
            console.error('Error en obtenerFiscalesActivos:', error);
            throw error;
        }
    }

    /**
     * Asignar fiscal a caso
     */
    async asignarFiscal(idCaso, idFiscal, idUsuarioSolicitante) {
        try {
            await spExecutor.execute('sp_Caso_AsignarFiscal', {
                IdCaso: idCaso,
                IdFiscal: idFiscal,
                IdUsuarioSolicitante: idUsuarioSolicitante
            });

            return {
                success: true,
                message: 'Fiscal asignado exitosamente'
            };

        } catch (error) {
            console.error('Error en asignarFiscal:', error);
            throw error;
        }
    }

    /**
     * Reasignar fiscal de caso con validación
     */
    async reasignarFiscal(idCaso, idNuevoFiscal, idUsuarioSolicitante) {
        try {
            const result = await spExecutor.executeWithOutput(
                'sp_Caso_ReasignarFiscalValidado',
                {
                    IdCaso: idCaso,
                    IdNuevoFiscal: idNuevoFiscal,
                    IdUsuarioSolicitante: idUsuarioSolicitante
                },
                [{ name: 'Resultado', type: sql.Int }]
            );

            const resultado = result.output.Resultado;
            
            if (resultado === 1) {
                return {
                    success: true,
                    message: 'Fiscal reasignado exitosamente'
                };
            } else {
                throw {
                    success: false,
                    message: 'No se pudo reasignar el fiscal. Verificar restricciones.',
                    code: config.ERROR_CODES.VALIDATION_ERROR,
                    statusCode: 400
                };
            }

        } catch (error) {
            console.error('Error en reasignarFiscal:', error);
            throw error;
        }
    }

    /**
     * Buscar casos por término
     */
    async buscarCasos(termino, pagina = 1, resultadosPorPagina = config.DEFAULT_PAGE_SIZE) {
        try {
            return await this.listarCasos({
                pagina,
                resultadosPorPagina,
                terminoBusqueda: termino
            });

        } catch (error) {
            console.error('Error en buscarCasos:', error);
            throw error;
        }
    }

    /**
     * Obtener casos por fiscal
     */
    async obtenerCasosPorFiscal(idFiscal, pagina = 1, resultadosPorPagina = config.DEFAULT_PAGE_SIZE) {
        try {
            return await this.listarCasos({
                pagina,
                resultadosPorPagina,
                idFiscalAsignadoFiltro: idFiscal
            });

        } catch (error) {
            console.error('Error en obtenerCasosPorFiscal:', error);
            throw error;
        }
    }

    /**
     * Obtener casos por estado
     */
    async obtenerCasosPorEstado(idEstado, pagina = 1, resultadosPorPagina = config.DEFAULT_PAGE_SIZE) {
        try {
            return await this.listarCasos({
                pagina,
                resultadosPorPagina,
                idEstadoCasoFiltro: idEstado
            });

        } catch (error) {
            console.error('Error en obtenerCasosPorEstado:', error);
            throw error;
        }
    }
}

module.exports = new CasoService();
