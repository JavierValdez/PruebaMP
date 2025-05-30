const authService = require('../services/authService');
const { asyncHandler } = require('../middlewares/errorHandler');

class AuthController {

    /**
     * Registrar nuevo usuario
     * POST /api/auth/register
     */
    register = asyncHandler(async (req, res) => {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    });

    /**
     * Iniciar sesión
     * POST /api/auth/login
     */
    login = asyncHandler(async (req, res) => {
        const { nombreUsuario, password } = req.body;
        const result = await authService.login(nombreUsuario, password);
        res.json(result);
    });

    /**
     * Refrescar token
     * POST /api/auth/refresh
     */
    refreshToken = asyncHandler(async (req, res) => {
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token requerido para renovación'
            });
        }

        const result = await authService.refreshToken(token);
        res.json(result);
    });

    /**
     * Cambiar contraseña
     * POST /api/auth/change-password
     */
    changePassword = asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;
        const idUsuario = req.user.idUsuario;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const result = await authService.changePassword(idUsuario, currentPassword, newPassword);
        res.json(result);
    });

    /**
     * Obtener perfil del usuario actual
     * GET /api/auth/profile
     */
    getProfile = asyncHandler(async (req, res) => {
        res.json({
            success: true,
            data: {
                idUsuario: req.user.idUsuario,
                nombreUsuario: req.user.nombreUsuario,
                email: req.user.email,
                primerNombre: req.user.primerNombre,
                primerApellido: req.user.primerApellido,
                roles: req.user.roles,
                permissions: req.user.permissions
            }
        });
    });

    /**
     * Cerrar sesión (lado cliente)
     * POST /api/auth/logout
     */
    logout = asyncHandler(async (req, res) => {
        // En una implementación JWT stateless, el logout se maneja del lado del cliente
        // eliminando el token del almacenamiento local
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    });

    /**
     * Verificar si el token es válido
     * GET /api/auth/verify
     */
    verifyToken = asyncHandler(async (req, res) => {
        // Si llegamos aquí, el middleware de auth ya validó el token
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                idUsuario: req.user.idUsuario,
                nombreUsuario: req.user.nombreUsuario,
                roles: req.user.roles,
                permissions: req.user.permissions
            }
        });
    });
}

module.exports = new AuthController();
