import Objection from 'objection'

const Model = Objection.Model
const snakeCaseMappers = Objection.snakeCaseMappers

class UserModel extends Model {

  static get tableName () {
    return 'users'
  }

  static get columnNameMappers () {
    return snakeCaseMappers()
  }

  static get defaultEagerAlgorithm () {
    return Model.JoinEagerAlgorithm
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'username'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        languageCode: { type: 'string', maxLength: 2, default: 'en' },
        theme: { type: 'string', maxLength: 40, default: 'github' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
      },
    }
  }

  $beforeInsert () {
    this.createdAt = new Date()
  }

  $beforeUpdate () {
    this.updatedAt = new Date()
  }

}

export default UserModel
