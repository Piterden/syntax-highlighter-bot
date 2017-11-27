import { Model, snakeCaseMappers } from 'objection'

class UserModel extends Model {

  static columnNameMappers = snakeCaseMappers()

  static get tableName () {
    return 'users'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['telegramId', 'name', 'theme'],
      properties: {
        id: { type: 'integer' },
        telegramId: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        theme: { type: 'string', minLength: 1, maxLength: 40 },
      },
    }
  }

}

export default UserModel
