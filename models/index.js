// models/index.js
const Sequelize = require("sequelize");
const config = require('../config/config')[process.env.NODE_ENV || 'development'];
const db = {};

// Configura Sequelize con las variables del archivo `.env`
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: 'postgres',
  }
);

db.Business = require("./Business.js")(sequelize, Sequelize);
db.User = require("./User.js")(sequelize, Sequelize);
db.Product = require("./Product.js")(sequelize, Sequelize);
db.Order = require("./Order.js")(sequelize, Sequelize);
db.BlacklistToken = require("./BlacklistToken.js")(sequelize, Sequelize);

// Registrar las asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Exportar la instancia de Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
