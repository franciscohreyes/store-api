# store-api


### Run Migrations

```
npx sequelize-cli db:migrate:undo:all
npx sequelize db:migrate
```

### Run tests:

```
npx jest businessController.test.js
```

### Run specified migration
```
npx sequelize-cli db:migrate --to NNNN-create-products.js
```

### Verificar la migración

```
npx sequelize-cli db:migrate:status
```

### Ejecutar seeders

```
npx sequelize-cli db:seed:all
```


