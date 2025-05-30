const express = require('express');
const informeController = require('../controllers/informeController');
const { authMiddleware, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de informes
router.use(authMiddleware);

/**
 * @route   GET /api/informes/dashboard
 * @desc    Obtener dashboard con métricas principales
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/dashboard', requirePermission('CASE_STATS'), informeController.obtenerDashboard);

/**
 * @route   GET /api/informes/estadisticas
 * @desc    Obtener estadísticas generales del sistema
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/estadisticas', requirePermission('CASE_STATS'), informeController.obtenerEstadisticas);

/**
 * @route   GET /api/informes/casos-por-estado
 * @desc    Obtener informe de casos agrupados por estado
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/casos-por-estado', requirePermission('CASE_STATS'), informeController.obtenerInformeCasosPorEstado);

/**
 * @route   GET /api/informes/casos-por-fiscal
 * @desc    Obtener informe de casos asignados por fiscal
 * @query   fiscalia - ID de fiscalía para filtrar (opcional)
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/casos-por-fiscal', requirePermission('CASE_STATS'), informeController.obtenerInformeCasosPorFiscal);

/**
 * @route   GET /api/informes/productividad-fiscalias
 * @desc    Obtener informe de productividad por fiscalía
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/productividad-fiscalias', requirePermission('CASE_STATS'), informeController.obtenerInformeProductividadPorFiscalia);

/**
 * @route   GET /api/informes/reasignaciones-fallidas
 * @desc    Obtener informe de intentos de reasignación fallidos
 * @query   fechaInicio - Fecha inicio del período (YYYY-MM-DD) (opcional)
 * @query   fechaFin - Fecha fin del período (YYYY-MM-DD) (opcional)
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/reasignaciones-fallidas', requirePermission('CASE_STATS'), informeController.obtenerInformeReasignacionesFallidas);

/**
 * @route   GET /api/informes/exportar/:tipo
 * @desc    Exportar informe en formato específico
 * @param   tipo - Tipo de informe (casos-estado, casos-fiscal, productividad, reasignaciones-fallidas)
 * @query   formato - Formato de exportación (json) (opcional, default: json)
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/exportar/:tipo', requirePermission('CASE_STATS'), informeController.exportarInforme);

module.exports = router;
