# Estructura de directorios

```md
store-api/
├── config/
│   ├── config.js          # Configuración de Sequelize y la base de datos
├── controllers/           # Controladores para cada módulo
├── docs/                  # APÏ Collections
├── middlewares/           # Middlewares para autenticación y roles
├── models/                # Modelos de la base de datos
├── routes/                # Rutas de la API
├── seeders/               # Seeders de carga inicial
├── server/server.js       # Punto de entrada de la aplicación
├── services/              # Servicios
├── tests/                 # Pruebas unitarias (TDD)
├── .env                   # Variables de entorno
└── package.json
```

# Configuración de la base de datos en .env

DB_HOST=localhost
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=your_database

# JWT SECRET
JWT_SECRET=your_jwt_secret
JWT_TTL=1
