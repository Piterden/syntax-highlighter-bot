import Objection from 'objection'

const { Model, snakeCaseMappers } = Objection

class ChatModel extends Model {
  static get tableName () {
    return 'chats'
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
      required: ['id', 'title', 'type'],
      properties: {
        id: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        type: { type: 'string', minLength: 1, maxLength: 40 },
        active: { type: 'boolean' },
        createdAt: { type: 'datetime' },
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

export default ChatModel
