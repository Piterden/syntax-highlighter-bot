module.exports = {
  development: {
    client: 'mysql',
    connection: {
      database: 'syntax',
      user: 'syntax',
      password: 'syntax',
      charset: 'utf8mb4',
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
    client: 'mysql',
    connection: {
      database: 'syntax',
      user: 'syntax',
      password: 'syntax',
      charset: 'utf8mb4',
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
    client: 'mysql',
    connection: {
      database: 'syntax',
      user: 'syntax',
      password: 'syntax',
      charset: 'utf8mb4',
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
