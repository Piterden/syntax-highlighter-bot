import { Model, snakeCaseMappers } from 'objection'

class ChatModel extends Model {

  static columnNameMappers = snakeCaseMappers();

  static defaultEagerAlgorithm = Model.JoinEagerAlgorithm;

  static get tableName () {
    return 'chats'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['telegramId', 'name', 'theme'],
      properties: {
        id: { type: 'integer' },
        telegramId: { type: 'string', minLength: 1, maxLength: 40 },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        active: { type: 'boolean' },
      },
    }
  }

}

export default ChatModel
