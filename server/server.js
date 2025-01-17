require('dotenv').config(); // Carga variables de entorno desde .env
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { sequelize } = require('../models'); // Importa la instancia de Sequelize
// Importa las rutas de los módulos
const businessRoutes = require('../routes/businessRoutes'); // Rutas del módulo de Negocios
const userRoutes = require('../routes/userRoutes'); // Rutas del módulo de Usuarios
const productRoutes = require('../routes/productRoutes'); // Rutas del módulo de Productos
const userOrders = require('../routes/userOrdersRoutes'); // Rutas del módulo de Ordenes

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Permitir solicitudes desde el frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  })
);
app.use(bodyParser.json()); // Parseo JSON en las solicitudes

// Rutas
app.use('/api/businesses', businessRoutes); // Endpoint principal para negocios
app.use('/api/users', userRoutes); // Endpoint principal para usuarios
app.use('/api/products', productRoutes); // Endpoint principal para productos
app.use('/api/orders', userOrders); // Endpoint principal para ordenes

// Ruta de prueba para asegurar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('API V1 funcionando correctamente.');
});

// Sincronización con la base de datos
sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a la base de datos exitosa.');
    return sequelize.sync({ alter: true }); // Sincroniza modelos con la base de datos
  })
  .then(() => {
    console.log('Sincronización de modelos completada.');
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
