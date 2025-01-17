const express = require('express');
const BusinessController = require('../controllers/BusinessController');
// Middlewares
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Crear un nuevo negocio
router.post('/', authenticate, authorize(['Negocio', 'Cliente']), BusinessController.createBusiness);

// Obtener todos los negocios
router.get('/', BusinessController.listBusinesses);

// Buscar negocios por nombre o ID
router.get('/search', authenticate, authorize(['Negocio']), BusinessController.searchBusinesses);

// Obtener un negocio por ID
router.get('/:id', authenticate, authorize(['Negocio']), BusinessController.getBusinessById);

// Actualizar un negocio
router.put('/:id', authenticate, authorize(['Negocio']), BusinessController.updateBusiness);

// Eliminar un negocio (marcar como eliminado)
router.delete('/:id', authenticate, authorize(['Negocio']), BusinessController.deleteBusiness);

module.exports = router;
