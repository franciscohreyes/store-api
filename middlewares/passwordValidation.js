const passwordValidationMiddleware = (req, res, next) => {
  const { password } = req.body;
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres',
    });
  }
  next();
};

module.exports = passwordValidationMiddleware;
