const express = require('express');
const casoController = require('../controllers/casoController');
const { authMiddleware, requirePermission } = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas de casos
router.use(authMiddleware);

/**
 * @route   GET /api/casos/estados
 * @desc    Obtener todos los estados de caso disponibles
 * @access  Private (cualquier usuario autenticado)
 */
router.get('/estados', casoController.obtenerEstados);

/**
 * @route   GET /api/casos/fiscales
 * @desc    Obtener todos los fiscales activos
 * @access  Private (cualquier usuario autenticado)
 */
router.get('/fiscales', casoController.obtenerFiscales);

/**
 * @route   GET /api/casos/buscar
 * @desc    Buscar casos por término
 * @access  Private (requiere permiso CASE_VIEW)
 */
router.get('/buscar', requirePermission('CASE_VIEW'), casoController.buscarCasos);

/**
 * @route   GET /api/casos/mis-casos
 * @desc    Obtener casos asignados al usuario actual
 * @access  Private (requiere permiso CASE_VIEW_OWN)
 */
router.get('/mis-casos', requirePermission('CASE_VIEW_OWN'), casoController.obtenerMisCasos);

/**
 * @route   GET /api/casos/estadisticas
 * @desc    Obtener estadísticas de casos
 * @access  Private (requiere permiso CASE_STATS)
 */
router.get('/estadisticas', requirePermission('CASE_STATS'), casoController.obtenerEstadisticas);

/**
 * @route   GET /api/casos/fiscal/:idFiscal
 * @desc    Obtener casos asignados a un fiscal específico
 * @access  Private (requiere permiso CASE_VIEW_ALL)
 */
router.get('/fiscal/:idFiscal', requirePermission('CASE_VIEW_ALL'), casoController.obtenerCasosPorFiscal);

/**
 * @route   GET /api/casos/estado/:idEstado
 * @desc    Obtener casos por estado
 * @access  Private (requiere permiso CASE_VIEW)
 */
router.get('/estado/:idEstado', requirePermission('CASE_VIEW'), casoController.obtenerCasosPorEstado);

/**
 * @route   GET /api/casos
 * @desc    Listar casos con paginación y filtros
 * @access  Private (requiere permiso CASE_VIEW)
 */
router.get('/', requirePermission('CASE_VIEW'), casoController.listarCasos);

/**
 * @route   POST /api/casos
 * @desc    Crear nuevo caso
 * @access  Private (requiere permiso CASE_CREATE)
 */
router.post('/', requirePermission('CASE_CREATE'), casoController.crearCaso);

/**
 * @route   GET /api/casos/:id
 * @desc    Obtener caso por ID
 * @access  Private (requiere permiso CASE_VIEW)
 */
router.get('/:id', requirePermission('CASE_VIEW'), casoController.obtenerCaso);

/**
 * @route   PUT /api/casos/:id
 * @desc    Actualizar caso
 * @access  Private (requiere permiso CASE_EDIT)
 */
router.put('/:id', requirePermission('CASE_EDIT'), casoController.actualizarCaso);

/**
 * @route   POST /api/casos/:id/asignar-fiscal
 * @desc    Asignar fiscal a caso
 * @access  Private (requiere permiso CASE_ASSIGN)
 */
router.post('/:id/asignar-fiscal', requirePermission('CASE_ASSIGN'), casoController.asignarFiscal);

/**
 * @route   POST /api/casos/:id/reasignar-fiscal
 * @desc    Reasignar fiscal de caso
 * @access  Private (requiere permiso CASE_REASSIGN)
 */
router.post('/:id/reasignar-fiscal', requirePermission('CASE_REASSIGN'), casoController.reasignarFiscal);

module.exports = router;
