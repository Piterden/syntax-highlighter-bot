require('dotenv').load()

const {
  DB_DRIVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_CHARSET,
} = process.env

module.exports = {
  development: {
    client: DB_DRIVER,
    connection: {
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  staging: {
    client: DB_DRIVER,
    connection: {
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },

  production: {
    client: DB_DRIVER,
    connection: {
      database: DB_DATABASE,
      user: DB_USER,
      password: DB_PASSWORD,
      charset: DB_CHARSET,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'migrations',
    },
  },
}
