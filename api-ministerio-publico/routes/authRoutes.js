const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token de acceso
 * @access  Public (requiere token válido o expirado)
 */
router.post('/refresh', authController.refreshToken);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar si el token es válido
 * @access  Private
 */
router.get('/verify', authMiddleware, authController.verifyToken);

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario actual
 * @access  Private
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario actual
 * @access  Private
 */
router.post('/change-password', authMiddleware, authController.changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (del lado cliente)
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
