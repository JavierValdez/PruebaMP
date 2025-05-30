const informeService = require('../services/informeService');
const { asyncHandler } = require('../middlewares/errorHandler');

class InformeController {

    /**
     * Obtener estadísticas generales del sistema
     * GET /api/informes/estadisticas
     */
    obtenerEstadisticas = asyncHandler(async (req, res) => {
        const result = await informeService.obtenerEstadisticasGenerales();
        res.json(result);
    });

    /**
     * Obtener dashboard con métricas principales
     * GET /api/informes/dashboard
     */
    obtenerDashboard = asyncHandler(async (req, res) => {
        const result = await informeService.obtenerDashboard();
        res.json(result);
    });

    /**
     * Obtener informe de casos por estado
     * GET /api/informes/casos-por-estado
     */
    obtenerInformeCasosPorEstado = asyncHandler(async (req, res) => {
        const result = await informeService.obtenerInformeCasosPorEstado();
        res.json(result);
    });

    /**
     * Obtener informe de casos por fiscal
     * GET /api/informes/casos-por-fiscal
     */
    obtenerInformeCasosPorFiscal = asyncHandler(async (req, res) => {
        const idFiscaliaFiltro = req.query.fiscalia ? parseInt(req.query.fiscalia) : null;
        
        if (req.query.fiscalia && isNaN(idFiscaliaFiltro)) {
            return res.status(400).json({
                success: false,
                message: 'ID de fiscalía inválido'
            });
        }

        const result = await informeService.obtenerInformeCasosPorFiscal(idFiscaliaFiltro);
        res.json(result);
    });

    /**
     * Obtener informe de productividad por fiscalía
     * GET /api/informes/productividad-fiscalias
     */
    obtenerInformeProductividadPorFiscalia = asyncHandler(async (req, res) => {
        const result = await informeService.obtenerInformeProductividadPorFiscalia();
        res.json(result);
    });

    /**
     * Obtener informe de reasignaciones fallidas
     * GET /api/informes/reasignaciones-fallidas
     */
    obtenerInformeReasignacionesFallidas = asyncHandler(async (req, res) => {
        const { fechaInicio, fechaFin } = req.query;
        
        // Validar fechas si se proporcionan
        let fechaInicioObj = null;
        let fechaFinObj = null;
        
        if (fechaInicio) {
            fechaInicioObj = new Date(fechaInicio);
            if (isNaN(fechaInicioObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha de inicio inválida. Usar formato YYYY-MM-DD'
                });
            }
        }
        
        if (fechaFin) {
            fechaFinObj = new Date(fechaFin);
            if (isNaN(fechaFinObj.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha de fin inválida. Usar formato YYYY-MM-DD'
                });
            }
        }

        const result = await informeService.obtenerInformeReasignacionesFallidas(
            fechaInicioObj, 
            fechaFinObj
        );
        res.json(result);
    });

    /**
     * Obtener métricas para exportación
     * GET /api/informes/exportar/:tipo
     */
    exportarInforme = asyncHandler(async (req, res) => {
        const { tipo } = req.params;
        const { formato = 'json' } = req.query;

        let result;
        let nombreArchivo;

        switch (tipo) {
            case 'casos-estado':
                result = await informeService.obtenerInformeCasosPorEstado();
                nombreArchivo = 'informe-casos-por-estado';
                break;
            case 'casos-fiscal':
                const fiscalia = req.query.fiscalia ? parseInt(req.query.fiscalia) : null;
                result = await informeService.obtenerInformeCasosPorFiscal(fiscalia);
                nombreArchivo = 'informe-casos-por-fiscal';
                break;
            case 'productividad':
                result = await informeService.obtenerInformeProductividadPorFiscalia();
                nombreArchivo = 'informe-productividad-fiscalias';
                break;
            case 'reasignaciones-fallidas':
                const { fechaInicio, fechaFin } = req.query;
                result = await informeService.obtenerInformeReasignacionesFallidas(
                    fechaInicio ? new Date(fechaInicio) : null,
                    fechaFin ? new Date(fechaFin) : null
                );
                nombreArchivo = 'informe-reasignaciones-fallidas';
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Tipo de informe no válido. Tipos disponibles: casos-estado, casos-fiscal, productividad, reasignaciones-fallidas'
                });
        }

        // Por ahora solo soportamos JSON, pero se puede extender para CSV, PDF, etc.
        if (formato === 'json') {
            const timestamp = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}-${timestamp}.json"`);
            res.json(result);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Formato no soportado. Formatos disponibles: json'
            });
        }
    });
}

module.exports = new InformeController();
