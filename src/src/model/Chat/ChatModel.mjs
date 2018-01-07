import Objection from 'objection'

class ChatModel extends Objection.Model {

  static get tableName () {
    return 'chats'
  }

  static get columnNameMappers () {
    return Objection.snakeCaseMappers()
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
