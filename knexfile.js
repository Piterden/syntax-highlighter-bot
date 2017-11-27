// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'syntax',
      user:     'syntax',
      password: 'syntax',
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
      user:     'syntax',
      password: 'syntax',
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
      user:     'syntax',
      password: 'syntax',
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
