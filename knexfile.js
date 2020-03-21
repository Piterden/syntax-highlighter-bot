import dotenv from 'dotenv'

dotenv.load()

const {
  DB_DRIVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_CHARSET,
} = process.env

const config = {
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
}

export default {
  staging: config,
  production: config,
  development: config,
}
