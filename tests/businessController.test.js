const { sequelize, Business } = require('../models'); // Importa el modelo de negocio
const BusinessController = require('../controllers/BusinessController'); // Importa el controlador

describe('BusinessController - Validar nombres duplicados', () => {
  beforeAll(async () => {
    // Configura la base de datos (puedes usar una base de datos en memoria para pruebas)
    await sequelize.sync({ force: true }); // Reinicia la base de datos antes de cada suite de prueba
  });

  afterAll(async () => {
    // Cierra la conexión a la base de datos después de las pruebas
    await sequelize.close();
  });

  test('No se debe permitir registrar un negocio con un nombre duplicado', async () => {
    // Datos de ejemplo
    const businessData = {
      name: 'Negocio Ejemplo',
      address: 'Calle Falsa 123',
    };

    // Crea un negocio con el nombre inicial
    await BusinessController.createBusiness(businessData);

    // Intenta crear un segundo negocio con el mismo nombre
    await expect(BusinessController.createBusiness(businessData)).rejects.toThrow(
      'Ya existe un negocio con este nombre'
    );
  });
});
