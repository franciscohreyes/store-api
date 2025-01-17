'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Generar hashes de contraseñas
    const hashedPasswords = await Promise.all([
      bcrypt.hash('password123', 10),
      bcrypt.hash('securepass456', 10),
      bcrypt.hash('mypass789', 10),
    ]);

    // Crear negocios
    const businesses = await queryInterface.bulkInsert('Businesses', [
      { name: 'Oficinas Premium', address: 'Calle 1, Ciudad A', isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Espacios Modernos', address: 'Calle 2, Ciudad B', isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Muebles Ejecutivos', address: 'Calle 3, Ciudad C', isDeleted: false, createdAt: new Date(), updatedAt: new Date() },
    ], { returning: true });

    // Crear productos para cada negocio
    const products = [];
    const furnitureDetails = [
      { name: 'Silla Ergonómica', description: 'Silla con soporte lumbar ajustable, ideal para largas jornadas.' },
      { name: 'Escritorio Moderno', description: 'Escritorio amplio y minimalista, con acabado en madera.' },
      { name: 'Lámpara LED', description: 'Lámpara de escritorio con luz ajustable y diseño moderno.' },
      { name: 'Estante Multifuncional', description: 'Estante compacto y versátil para organizar documentos y libros.' },
      { name: 'Silla Giratoria', description: 'Silla con ruedas y ajuste de altura, ideal para oficinas dinámicas.' },
    ];

    businesses.forEach((business, index) => {
      furnitureDetails.forEach((item) => {
        products.push({
          name: `${item.name} - Modelo ${index + 1}`,
          description: item.description,
          price: Math.floor(Math.random() * 5000) + 1000,
          businessId: business.id,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    const insertedProducts = await queryInterface.bulkInsert('Products', products, { returning: true });

    // Crear usuarios con contraseñas encriptadas
    const users = await queryInterface.bulkInsert('Users', [
      {
        name: 'Juan Pérez',
        email: 'juanperez@example.com',
        password: hashedPasswords[0],
        role: 'Cliente',
        isDeleted: false,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Maria Lopez',
        email: 'marialopez@example.com',
        password: hashedPasswords[1],
        role: 'Cliente',
        isDeleted: false,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Carlos Torres',
        email: 'carlostorres@example.com',
        password: hashedPasswords[2],
        role: 'Cliente',
        isDeleted: false,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { returning: true });

    // Crear órdenes para cada usuario
    const statuses = ['Por pagar', 'Pagada', 'Cancelada'];
    const orders = [];
    const orderProducts = [];

    users.forEach((user, userIndex) => {
      statuses.forEach((status, statusIndex) => {
        const assignedBusiness = businesses[userIndex % businesses.length];
        const subtotal = Math.floor(Math.random() * 10000) + 500;
        const iva = parseFloat((subtotal * 0.16).toFixed(2));
        const total = parseFloat((subtotal + iva).toFixed(2));

        const order = {
          userId: user.id,
          businessId: assignedBusiness.id,
          status,
          subtotal,
          iva,
          total,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        orders.push(order);

        // Vincular productos a la orden
        const productsForOrder = insertedProducts.slice(0, 3);

        productsForOrder.forEach((product) => {
          orderProducts.push({
            orderId: orders.length,
            productId: product.id,
            quantity: Math.floor(Math.random() * 5) + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        });
      });
    });

    const insertedOrders = await queryInterface.bulkInsert('Orders', orders, { returning: true });

    orderProducts.forEach((orderProduct, index) => {
      orderProduct.orderId = insertedOrders[Math.floor(index / 3)].id;
    });

    await queryInterface.bulkInsert('OrderProducts', orderProducts);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Orders', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Businesses', null, {});
  },
};
