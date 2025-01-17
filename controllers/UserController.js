const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// Models
const { User, BlacklistToken } = require('../models');
const { Op, where } = require('sequelize');

class UserController {
  // Crear usuario
  static async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validar unicidad del email
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un usuario con la misma dirección de correo electrónico',
        });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      return res.status(201).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Obtener usuario por ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findOne({
        where: { id, isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Buscar usuarios por ID, Nombre o Correo
  static async searchUsers(req, res) {
    try {
      const { query } = req.query;
      const conditions = [];

      // Verifica si el query es numérico y agrega la condición para `id`
      if (!isNaN(query)) {
        conditions.push({ id: query });
      }

      // Agrega las condiciones para `name` y `email`
      conditions.push(
        { name: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } }
      );

      // Realiza la búsqueda
      const users = await User.findAll({
        where: {
          [Op.or]: conditions,
        },
      });

      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'No se han encontrado usuarios que cumplan los criterios' });
      }

      return res.status(200).json({ success: true, data: users });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Se ha producido un error al buscar usuarios',
        error: error.message,
      });
    }
  }

  static async updateUser(req, res) {
      try {
        const { id } = req.params;
        const { name, password, role } = req.body;

        const user = await User.findOne({
          where: { id, isDeleted: false },
        });

        if (!user) {
          return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        let hashedPassword = "";
        if (password) {
          // Validar longitud de la contraseña
          if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
          }
          // Hash de la contraseña
          hashedPassword = await bcrypt.hash(password, 10);
          user.password = hashedPassword;
        }

        if (role) user.role = role;
        const newPass = hashedPassword;

        await user.update({ name, password: newPass, role });
        return res.status(200).json({ success: true, data: user });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Se ha producido un error al actualizar el usuario',
          error: error.message,
        });
      }
  }

  /**
   * Elimina lógicamente un usuario.
   * @param {Object} req - Solicitud HTTP
   * @param {Object} res - Respuesta HTTP
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Buscar el usuario por ID
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Realizar eliminación lógica
      await user.update({ isDeleted: true });

      return res.status(200).json({
        success: true,
        message: 'Usuario eliminado correctamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while deleting the user',
        error: error.message,
      });
    }
  }

  // Verificar acceso
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email, isDeleted: false } });

      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
      }

      // Validar verificación
      if (!user.isVerified) {
        return res.status(403).json({
          success: false,
          message: 'La cuenta no está verificada. Por favor, verifique su cuenta antes de iniciar sesión.',
        });
      }

      // Validar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'El usuario o la contraseña no son válidas' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Duración del token
      });

      // Respuesta exitosa (puedes incluir un token aquí)
      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión correcto',
        token
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Se ha producido un error',
        error: error.message,
      });
    }
  }

  static async logout(req, res) {
    try {
      // Obtener el token del encabezado Authorization
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token no proporcionado',
        });
      }

      // Agregar el token a la lista negra
      await BlacklistToken.create({ token });

      return res.status(200).json({
        success: true,
        message: 'Sesión cerrada correctamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Se ha producido un error al cerrar la sesión',
        error: error.message,
      });
    }
  }


  static async activateAccount(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
      }

      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'La cuenta ya está activada',
        });
      }

      // Actualiza el estado de activación
      user.isVerified = true;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Cuenta activada correctamente',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

}

module.exports = UserController;
