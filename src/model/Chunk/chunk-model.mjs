import Objection from 'objection'
import UserModel from '../User/user-model'
import ChatModel from '../Chat/chat-model'
import { onError } from '../../config/methods'


const { Model, snakeCaseMappers } = Objection

class ChunkModel extends Model {
  /**
   * The DB table name
   *
   * @static
   * @returns {string}
   */
  static get tableName() {
    return 'chunks'
  }

  /**
   * Columns names mapper rules
   *
   * @static
   */
  static get columnNameMappers() {
    return snakeCaseMappers()
  }

  /**
   * Default eager behavior
   *
   * @static
   * @returns {EagerAlgorithm}
   */
  static get defaultEagerAlgorithm() {
    return Model.JoinEagerAlgorithm
  }

  /**
   * JSON schema getter
   *
   * @static
   * @returns {Object}
   */
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

  /**
   * Relation mappings getter
   *
   * @static
   * @returns {Object}
   */
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

  /**
   * Store the chunk of code
   *
   * @static
   * @param {Context} ctx
   * @param {string} filename
   * @param {string} source
   * @param {string} lang
   */
  static store(ctx, filename, source, lang) {
    const userId = ctx.state.user.id
    const chatId = ctx.chat.id

    this.query()
      .insert({ filename, userId, chatId, lang, source })
      .then()
      .catch(onError)
  }

  /**
   * Fires before insert in the DB
   */
  $beforeInsert() {
    this.createdAt = new Date()
  }
}

export default ChunkModel
