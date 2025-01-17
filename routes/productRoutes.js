const express = require('express');
const ProductController = require('../controllers/ProductController');
// Middlewares
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const router = express.Router();

// Crear un nuevo producto
router.post('/', authenticate, authorize(['Negocio', 'Cliente']), ProductController.createProduct);

// Obtener todos los productos de un negocio
router.get('/', authenticate, authorize(['Negocio', 'Cliente']), ProductController.listProducts);

// Buscar productos por nombre o ID
router.get('/search', authenticate, authorize(['Negocio', 'Cliente']), ProductController.searchProducts);

// Obtener un producto por ID
router.get('/:id', authenticate, authorize(['Negocio']), ProductController.listProducts);

// Actualizar un producto
router.put('/:id', authenticate, authorize(['Negocio']), ProductController.updateProduct);

// Eliminar un producto (marcar como eliminado)
router.delete('/:id', authenticate, authorize(['Negocio']), ProductController.deleteProduct);

// Actualizar el inventario después de una compra
router.put('/inventory', authenticate, authorize(['Negocio']), ProductController.updateInventoryAfterOrder);

module.exports = router;
