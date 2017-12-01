import Objection from 'objection'

const Model = Objection.Model
const snakeCaseMappers = Objection.snakeCaseMappers

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
      required: ['telegramId', 'name', 'theme'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        active: { type: 'boolean' },
        createdAt: { type: 'datetime' },
      },
    }
  }

  findOrNew (chat, cb) {
    this
      .findById(chat.id)
      .then(chatEntry => cb(chatEntry))
      .catch(() => {
        this
          .query()
          .insert({ id: chat.id, name: chat.username || '', active: true })
          .returning('*')
          .then(chatEntry => cb(chatEntry))
      })
  }

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
  }

  $beforeUpdate () {
    this.updatedAt = new Date().toISOString()
  }

}

export default ChatModel
