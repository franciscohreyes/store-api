const { sequelize, Order, Product } = require('../models');

async function payOrder(orderId, userId) {
  const transaction = await sequelize.transaction();
  try {
    // Buscar la orden con los productos relacionados
    const order = await Order.findOne({
      where: { id: orderId, userId },
      include: {
        model: Product,
        as: 'products',
      },
      transaction,
    });

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    if (order.status !== 'Por pagar') {
      throw new Error('Solo se puede pagar una orden con el estado (Por pagar)');
    }

    // Actualizar el estado de la orden
    await order.update({ status: 'Pagada' }, { transaction });

    // Reducir el inventario de los productos
    for (const product of order.products) {
      const productInDb = await Product.findByPk(product.id, { transaction });

      // Verificar stock suficiente
      if (productInDb.quantity < product.quantity) {
        throw new Error(`Stock insuficiente para el producto ${productInDb.name}`);
      }

      await productInDb.update(
        { quantity: productInDb.quantity - product.quantity },
        { transaction }
      );
    }

    await transaction.commit();
    return 'Orden pagada con éxito';
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = { payOrder };
