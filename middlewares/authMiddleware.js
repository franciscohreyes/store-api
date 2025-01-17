const jwt = require('jsonwebtoken');
const { User, BlacklistToken } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token missing or invalid' });
    }

    // Verificar si el token está en la lista negra
    const blacklisted = await BlacklistToken.findOne({ where: { token } });

    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: 'El token no es válido. Por favor, inicia sesión nuevamente.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Invalid user' });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access forbidden: insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
