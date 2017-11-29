import { Model, snakeCaseMappers } from 'objection'
import UserModel from '../User/UserModel'
import ChatModel from '../Chat/ChatModel'

class UseModel extends Model {

  static columnNameMappers = snakeCaseMappers();

  static defaultEagerAlgorithm = Model.JoinEagerAlgorithm;

  static get tableName () {
    return 'uses'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['userId', 'chatId'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        chatId: { type: 'integer' },
        active: { type: 'boolean', default: true },
      },
    }
  }

  static get relationMappings () {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'UseModel.userId',
          to: 'UserModel.id',
        },
      },

      chat: {
        relation: Model.BelongsToOneRelation,
        modelClass: ChatModel,
        join: {
          from: 'UseModel.chatId',
          to: 'ChatModel.id',
        },
      },
    }
  }

  $beforeInsert () {
    this.createdAt = new Date().toISOString()
  }

}

export default UseModel
