import Objection from 'objection'
import UserModel from '../User/user-model'
import ChatModel from '../Chat/chat-model'


const { Model, snakeCaseMappers } = Objection

class ChunkModel extends Model {
  static get tableName() {
    return 'chunks'
  }

  static get columnNameMappers() {
    return snakeCaseMappers()
  }

  static get defaultEagerAlgorithm() {
    return Model.JoinEagerAlgorithm
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['filename', 'userId', 'chatId'],
      properties: {
        filename: { type: 'string' },
        userId: { type: 'integer' },
        chatId: { type: 'integer' },
        lang: { type: 'string' },
        source: { type: 'string' },
        createdAt: { type: 'datetime' },
      },
    }
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'chunks.userId',
          to: 'users.id',
        },
      },

      chat: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChatModel,
        join: {
          from: 'chunks.userId',
          to: 'chats.id',
        },
      },
    }
  }

  $beforeInsert() {
    this.createdAt = new Date()
  }
}

export default ChunkModel
