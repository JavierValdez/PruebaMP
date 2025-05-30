const casoService = require('../services/casoService');
const { asyncHandler } = require('../middlewares/errorHandler');

class CasoController {

    /**
     * Crear nuevo caso
     * POST /api/casos
     */
    crearCaso = asyncHandler(async (req, res) => {
        const idUsuarioCreacion = req.user.idUsuario;
        const result = await casoService.crearCaso(req.body, idUsuarioCreacion);
        res.status(201).json(result);
    });

    /**
     * Obtener caso por ID
     * GET /api/casos/:id
     */
    obtenerCaso = asyncHandler(async (req, res) => {
        const idCaso = parseInt(req.params.id);
        
        if (isNaN(idCaso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de caso inválido'
            });
        }

        const result = await casoService.obtenerCasoPorId(idCaso);
        res.json(result);
    });

    /**
     * Listar casos con paginación y filtros
     * GET /api/casos
     */
    listarCasos = asyncHandler(async (req, res) => {
        const filtros = {
            pagina: parseInt(req.query.pagina) || 1,
            resultadosPorPagina: parseInt(req.query.resultadosPorPagina) || 10,
            idEstadoCasoFiltro: req.query.idEstadoCaso ? parseInt(req.query.idEstadoCaso) : null,
            idFiscalAsignadoFiltro: req.query.idFiscalAsignado ? parseInt(req.query.idFiscalAsignado) : null,
            terminoBusqueda: req.query.busqueda || null
        };

        const result = await casoService.listarCasos(filtros);
        res.json(result);
    });

    /**
     * Actualizar caso
     * PUT /api/casos/:id
     */
    actualizarCaso = asyncHandler(async (req, res) => {
        const idCaso = parseInt(req.params.id);
        const idUsuarioModificacion = req.user.idUsuario;
        
        if (isNaN(idCaso)) {
            return res.status(400).json({
                success: false,
                message: 'ID de caso inválido'
            });
        }

        const result = await casoService.actualizarCaso(idCaso, req.body, idUsuarioModificacion);
        res.json(result);
    });

    /**
     * Obtener estados de caso
     * GET /api/casos/estados
     */
    obtenerEstados = asyncHandler(async (req, res) => {
        const result = await casoService.obtenerEstadosCaso();
        res.json(result);
    });

    /**
     * Obtener fiscales activos
     * GET /api/casos/fiscales
     */
    obtenerFiscales = asyncHandler(async (req, res) => {
        const result = await casoService.obtenerFiscalesActivos();
        res.json(result);
    });

    /**
     * Asignar fiscal a caso
     * POST /api/casos/:id/asignar-fiscal
     */
    asignarFiscal = asyncHandler(async (req, res) => {
        const idCaso = parseInt(req.params.id);
        const { idFiscal } = req.body;
        const idUsuarioSolicitante = req.user.idUsuario;
        
        if (isNaN(idCaso) || !idFiscal) {
            return res.status(400).json({
                success: false,
                message: 'ID de caso e ID de fiscal son requeridos'
            });
        }

        const result = await casoService.asignarFiscal(idCaso, idFiscal, idUsuarioSolicitante);
        res.json(result);
    });

    /**
     * Reasignar fiscal de caso
     * POST /api/casos/:id/reasignar-fiscal
     */
    reasignarFiscal = asyncHandler(async (req, res) => {
        const idCaso = parseInt(req.params.id);
        const { idNuevoFiscal } = req.body;
        const idUsuarioSolicitante = req.user.idUsuario;
        
        if (isNaN(idCaso) || !idNuevoFiscal) {
            return res.status(400).json({
                success: false,
                message: 'ID de caso e ID de nuevo fiscal son requeridos'
            });
        }

        const result = await casoService.reasignarFiscal(idCaso, idNuevoFiscal, idUsuarioSolicitante);
        res.json(result);
    });

    /**
     * Buscar casos
     * GET /api/casos/buscar
     */
    buscarCasos = asyncHandler(async (req, res) => {
        const { termino, pagina = 1, resultadosPorPagina = 10 } = req.query;
        
        if (!termino) {
            return res.status(400).json({
                success: false,
                message: 'Término de búsqueda requerido'
            });
        }

        const result = await casoService.buscarCasos(
            termino,
            parseInt(pagina),
            parseInt(resultadosPorPagina)
        );
        res.json(result);
    });

    /**
     * Obtener casos por fiscal
     * GET /api/casos/fiscal/:idFiscal
     */
    obtenerCasosPorFiscal = asyncHandler(async (req, res) => {
        const idFiscal = parseInt(req.params.idFiscal);
        const { pagina = 1, resultadosPorPagina = 10 } = req.query;
        
        if (isNaN(idFiscal)) {
            return res.status(400).json({
                success: false,
                message: 'ID de fiscal inválido'
            });
        }

        const result = await casoService.obtenerCasosPorFiscal(
            idFiscal,
            parseInt(pagina),
            parseInt(resultadosPorPagina)
        );
        res.json(result);
    });

    /**
     * Obtener casos por estado
     * GET /api/casos/estado/:idEstado
     */
    obtenerCasosPorEstado = asyncHandler(async (req, res) => {
        const idEstado = parseInt(req.params.idEstado);
        const { pagina = 1, resultadosPorPagina = 10 } = req.query;
        
        if (isNaN(idEstado)) {
            return res.status(400).json({
                success: false,
                message: 'ID de estado inválido'
            });
        }

        const result = await casoService.obtenerCasosPorEstado(
            idEstado,
            parseInt(pagina),
            parseInt(resultadosPorPagina)
        );
        res.json(result);
    });

    /**
     * Obtener casos asignados al usuario actual (si es fiscal)
     * GET /api/casos/mis-casos
     */
    obtenerMisCasos = asyncHandler(async (req, res) => {
        const { pagina = 1, resultadosPorPagina = 10 } = req.query;
        
        // Verificar si el usuario actual es un fiscal
        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes('CASE_VIEW_OWN')) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver casos asignados'
            });
        }

        // Aquí deberías obtener el ID del fiscal basado en el usuario actual
        // Por simplicidad, asumimos que tienes un método para esto
        // const idFiscal = await obtenerIdFiscalPorUsuario(req.user.idUsuario);
        
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad pendiente de implementar: obtener ID fiscal del usuario'
        });
    });

    /**
     * Obtener estadísticas de casos
     * GET /api/casos/estadisticas
     */
    obtenerEstadisticas = asyncHandler(async (req, res) => {
        // Esta sería una funcionalidad adicional para dashboard
        return res.status(501).json({
            success: false,
            message: 'Funcionalidad pendiente de implementar: estadísticas de casos'
        });
    });
}

module.exports = new CasoController();
