const { Business } = require('../models');
const { Op, where } = require('sequelize')

class BusinessController {
  static async createBusiness(req, res) {
    try {
      const { name, address } = req.body;

      // Validar que el nombre no esté vacío
      if (!name || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del negocio no puede estar vacío',
        });
      }

      // Verificar si ya existe un negocio con el mismo nombre
      const existingBusiness = await Business.findOne({
        where: { name: { [Op.iLike]: name } },
      });

      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un negocio con este nombre'
        });
      }

      // Crear el nuevo negocio si no existe uno con el mismo nombre
      const business = await Business.create({ name, address });
      return res.status(201).json({ success: true, data: business });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Se ha producido un error al crear el negocio",
        error: error.message
      });
    }
  }

  static async getBusinessById(req, res) {
    try {
      const { id } = req.params;
      const business = await Business.findOne({
        where: { id, isDeleted: false },
      });
      if (!business) {
        return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
      }
      return res.status(200).json({ success: true, data: business });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listBusinesses(req, res) {
    try {
      const businesses = await Business.findAll({
        where: { isDeleted: false },
        order: [['name', 'ASC']],
      });
      return res.status(200).json({ success: true, data: businesses });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async searchBusinesses(req, res) {
    try {
      const { id, name } = req.query;

      // Construir las condiciones de búsqueda dinámicamente
      const conditions = { isDeleted: false };

      if (id) {
        conditions.id = id; // Buscar por ID exacto
      }
      if (name) {
        conditions.name = { [Op.iLike]: `%${name}%` }; // Buscar coincidencias parciales por nombre
      }

      // Realizar la búsqueda
      const businesses = await Business.findAll({ where: conditions });

      if (businesses.length === 0) {
        return res.status(404).json({ success: false, message: 'No se han encontrado negocios que cumplan los criterios' });
      }

      return res.status(200).json({ success: true, data: businesses });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Se ha producido un error al buscar negocios',
        error: error.message,
      });
    }
  }

  static async updateBusiness(req, res) {
    try {
      const { id } = req.params;
      const { name, address } = req.body;

      const business = await Business.findOne({
        where: { id, isDeleted: false },
      });

      if (!business) {
        return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
      }

      await business.update({ name, address });
      return res.status(200).json({ success: true, data: business });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteBusiness(req, res) {
    try {
      const { id } = req.params;
      const business = await Business.findOne({
        where: { id, isDeleted: false },
      });

      if (!business) {
        return res.status(404).json({ success: false, message: 'Negocio no encontrado' });
      }

      await business.update({ isDeleted: true });
      return res.status(200).json({ success: true, message: 'Negocio eliminado con éxito' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = BusinessController;
