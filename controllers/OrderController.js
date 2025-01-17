// controllers/OrderController.js
const { Order, Product, User, Business } = require('../models');
const { Op, where } = require('sequelize');
// Services
const payOrderService = require('../services/payOrderService');

class OrderController {
  // Crear una nueva orden
  static async createOrder(req, res) {
    try {
      const { businessId, userId, products, subtotal, iva, total, quantity } = req.body;

      const newOrder = await Order.create({
        businessId,
        userId,
        products,
        subtotal,
        iva,
        total,
        quantity,
        status: 'Por pagar',
      });

      return res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear la orden',
        error: error.message,
      });
    }
  }

  // Obtener órdenes con filtros
  static async getOrders(req, res) {
    try {
      const { id, status, total, role, userId, businessId } = req.query;

      const where = { isDeleted: false};
      if (id) where.id = id;
      if (status) where.status = status;
      if (total) where.total = total;

      if (role === 'Negocio' && businessId) where.businessId = businessId;
      if (role === 'customer' && userId) where.userId = userId;

      const orders = await Order.findAll({ where });

      if (!orders.length) {
        return res.status(404).json({ success: false, message: 'No se encontraron órdenes' });
      }

      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las órdenes',
        error: error.message,
      });
    }
  }

  static async getOrderById(req, res) {
    try {
      const { id } = req.params; // Obtener el ID de la orden desde los parámetros de la URL

      // Buscar la orden en la base de datos
      const order = await Order.findOne({
        where: { id },
      });

      // Si no se encuentra la orden
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      // Si la orden se encuentra, devolverla
      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al obtener la orden',
        error: error.message,
      });
    }
  }

  // Actualizar el estado de una orden
  static async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { role, userId, businessId } = req.query;

      const order = await Order.findByPk(id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      if (role === 'Cliente' && order.userId !== userId) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para cancelar esta orden' });
      }

      if (role === 'Negocio' && order.businessId !== businessId) {
        return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta orden' });
      }

      order.status = status;
      await order.save();

      return res.status(200).json({ success: true, data: order });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el estado de la orden',
        error: error.message,
      });
    }
  }

  // Pagar la orden
  // Pagar la orden
static async payOrder(req, res) {
  try {
    const { orderId } = req.body;

    // Validar que se envía el `orderId`
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'El campo orderId es obligatorio',
      });
    }

    const userId = req.user?.id; // Asegurarse de que `req.user` está definido

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Llamar al servicio para procesar el pago de la orden
    const result = await payOrderService.payOrder(orderId, userId);

    return res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el pago',
      error: error.message,
    });
  }
}


  // Cancelar la orden
  static async cancelOrder(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user.id;

      // Buscar la orden
      const order = await Order.findOne({
        where: { id: orderId, userId },
        include: {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity'] },
        },
      });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      if (order.status !== 'Por pagar') {
        return res.status(400).json({ success: false, message: 'Solo se puede cancelar una orden con el estado "Por pagar"' });
      }

      // Actualizar el estatus de la orden a "Cancelada"
      await order.update({ status: 'Cancelada' });

      // Devolver los productos al inventario
      for (const product of order.products) {
        const productInDb = await Product.findByPk(product.id);
        if (productInDb) {
          // Aumentar el inventario
          await productInDb.update({ quantity: productInDb.quantity + product.quantity });
        }
      }

      return res.status(200).json({ success: true, message: 'Orden cancelada con éxito' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al cancelar la orden', error: error.message });
    }
  }

  static async returnOrder(req, res) {
    try {
      const { orderId } = req.body;
      const businessId = req.user.businessId; // Obtener el businessId desde el usuario logueado

      // Buscar la orden
      const order = await Order.findOne({ where: { id: orderId, businessId: businessId } });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' });
      }

      if (order.status !== 'Pagada') {
        return res.status(400).json({ success: false, message: 'Solo se puede devolver una orden con el estado "Pagada"' });
      }

      // Actualizar el estatus de la orden a "Por pagar"
      await order.update({ status: 'Por pagar' });

      // Volver los productos al inventario
      for (const product of order.products) {
        const productInDb = await Product.findByPk(product.id);
        if (productInDb) {
          await productInDb.update({ quantity: productInDb.quantity + product.quantity });
        }
      }

      return res.status(200).json({ success: true, message: 'Orden devuelta con éxito' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error al devolver la orden', error: error.message });
    }
  }

  // Eliminar una orden
  static async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findOne({ where: { id, isDeleted: false } });

      if (!order) {
        return res.status(404).json({ success: false, message: 'Orden no encontrado' });
      }

      await order.update({ isDeleted: true });
      return res.status(200).json({ success: true, message: 'Orden eliminado con éxito' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

}

module.exports = OrderController;
