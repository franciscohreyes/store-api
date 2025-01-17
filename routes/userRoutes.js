const express = require('express');
const UserController = require('../controllers/UserController');
// Middlewares
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const passwordValidationMiddleware = require('../middlewares/passwordValidation');
const router = express.Router();

// Login
router.post('/auth/login', UserController.login);

// Register
router.post('/auth/register', passwordValidationMiddleware, UserController.createUser);

// Logout
router.post('/auth/logout', UserController.logout);

// Get user by ID
router.get('/:id', authenticate, authorize(['Negocio', 'Cliente']), UserController.getUserById);

// Activate account
router.post('/activate/:id', UserController.activateAccount);

// Search users
router.get('/', authenticate, authorize(['Negocio']), UserController.searchUsers);

// Update user
router.put('/:id', authenticate, authorize(['Negocio', 'Cliente']), UserController.updateUser);

// Delete user
router.delete('/:id', authenticate, authorize(['Negocio', 'Cliente']), UserController.deleteUser);

module.exports = router;
