const { Product, Business } = require('../models');
const { Op } = require('sequelize');

class ProductController {
  // Crear un nuevo producto
  static async createProduct(req, res) {
    try {
      const { name, description, price, quantity, stock, businessId } = req.body;

      // Validar que el nombre no esté vacío
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del producto no puede estar vacío',
        });
      }

      if (!price || price.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El precop del producto no puede estar vacío',
        });
      }

      // Verificar que el negocio existe
      const business = await Business.findOne({ where: { id: businessId, isDeleted: false } });
      if (!business) {
        return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
      }

      // Validación de precio
      if (price < 0) {
        return res.status(400).json({ success: false, message: 'El precio no puede ser negativo' });
      }

      // Crear el producto
      const product = await Product.create({ name, description, price, quantity, stock, businessId, description });
      return res.status(201).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear el producto',
        error: error.message,
      });
    }
  }

  // Obtener un producto por ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findOne({
        where: { id, isDeleted: false },
        include: [{ model: Business, attributes: ['name'] }],
      });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Listar productos de un negocio
  static async listProducts(req, res) {
    try {
      const { businessId } = req.query;

      // Verificar que el negocio existe
      const business = await Business.findOne({ where: { id: businessId, isDeleted: false } });

      if (!business) {
        return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
      }

      const products = await Product.findAll({
        where: { businessId, isDeleted: false },
        order: [['name', 'ASC']],
      });

      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Se ha producido un error al listar los productos",
        error: error.message
      });
    }
  }

  // Búsqueda de productos por nombre o ID
  static async searchProducts(req, res) {
    try {
      const { id, name, businessId } = req.query;

      // Validar negocio existente
      const business = await ProductController.validateBusiness(businessId);
      if (!business) {
        return ProductController.handleError(res, 404, 'Negocio no encontrado');
      }

      // Construir condiciones dinámicas
      const conditions = ProductController.buildSearchConditions(id, name, businessId);

      // Buscar productos
      const products = await Product.findAll({ where: conditions });
      if (!products.length) {
        return ProductController.handleError(res, 404, 'No se encontraron productos');
      }

      return res.status(200).json({ success: true, data: products });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al buscar productos',
        error: error.message,
      });
    }
  }

  // Actualizar un producto
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, quantity, stock } = req.body;

      const product = await Product.findOne({ where: { id, isDeleted: false } });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      if (price < 0) {
        return res.status(400).json({ success: false, message: 'El precio no puede ser negativo' });
      }

      await product.update({ name, description, price, quantity, stock });
      return res.status(200).json({ success: true, data: product });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Eliminar un producto (marcar como eliminado)
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ where: { id, isDeleted: false } });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      await product.update({ isDeleted: true });
      return res.status(200).json({ success: true, message: 'Producto eliminado con éxito' });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Actualizar inventario después de una compra
  static async updateInventoryAfterOrder(req, res) {
    try {
      const { productId, quantity } = req.body;

      // Verificar que el producto existe
      const product = await Product.findOne({ where: { id: productId, isDeleted: false } });

      if (!product) {
        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Inventario insuficiente' });
      }

      // Disminuir el inventario
      await product.update({ stock: product.stock - quantity });

      return res.status(200).json({ success: true, message: 'Inventario actualizado con éxito', data: product });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el inventario',
        error: error.message,
      });
    }
  }

  // Validar existencia del negocio
  static async validateBusiness(businessId) {
    if (!businessId) return null; // Validar que exista un ID
    return await Business.findOne({ where: { id: businessId, isDeleted: false } });
  }

  // Construir condiciones de búsqueda dinámicas
  static buildSearchConditions(id, name, businessId) {
    const conditions = { isDeleted: false, businessId };

    if (id) {
      conditions.id = id; // Búsqueda exacta por ID
    }

    if (name) {
      conditions.name = { [Op.iLike]: `%${name}%` }; // Búsqueda parcial por nombre
    }

    return conditions;
  }

  // Manejo de errores centralizado
  static handleError(res, status, message, error = null) {
    return res.status(status).json({
      success: false,
      message,
      ...(error && { error }), // Incluir detalles del error solo si están disponibles
    });
  }
}

module.exports = ProductController;
