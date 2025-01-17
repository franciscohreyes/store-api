// routes/orderRoutes.js
const express = require('express');
const OrderController = require('../controllers/OrderController');
// Middlewares
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Crear una nueva orden
router.post('/', authenticate, OrderController.createOrder);

// Obtener órdenes con filtros
router.get('/', authenticate, OrderController.getOrders);

// Obtener una orden por ID
router.get('/:id', authenticate, authorize(['Negocio', 'Cliente']), OrderController.getOrderById);

// Pagar una orden
router.put('/pay', authenticate, authorize(['Cliente']), OrderController.payOrder);

// Cancelar una orden
router.put('/cancel', authenticate, authorize(['Negocio', 'Cliente']), OrderController.cancelOrder);

// Devolver una orden
router.put('/return', authenticate, authorize(['Negocio']), OrderController.returnOrder);

// Elinimar una orden
router.delete('/:id', authenticate, authorize(['Negocio']), OrderController.deleteOrder);

// Actualizar el estado de una orden
router.patch('/:id/status', OrderController.updateOrderStatus);

module.exports = router;
