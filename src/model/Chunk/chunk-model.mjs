import Objection from 'objection'
import UserModel from '../User/user-model'
import ChatModel from '../Chat/chat-model'

const { Model, snakeCaseMappers } = Objection

class ChunkModel extends Model {
  /**
   * The DB table name
   *
   * @static
   * @returns {string}
   */
  static get tableName () {
    return 'chunks'
  }

  /**
   * Columns names mapper rules
   *
   * @static
   */
  static get columnNameMappers () {
    return snakeCaseMappers()
  }

  /**
   * Default eager behavior
   *
   * @static
   * @returns {EagerAlgorithm}
   */
  static get defaultEagerAlgorithm () {
    return Model.JoinEagerAlgorithm
  }

  /**
   * JSON schema getter
   *
   * @static
   * @returns {Object}
   */
  static get jsonSchema () {
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
  static get relationMappings () {
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
          from: 'chunks.chatId',
          to: 'chats.id',
        },
      },
    }
  }

  /**
   * Store the chunk of a code
   *
   * @static
   * @param {{userId,chatId,filename,lang,source}} data The chunk data
   * @param {Function} cb The callback function
   */
  static store (data) {
    return new Promise((resolve, reject) => {
      this.query()
        .where('filename', data.filename)
        .then((chunk) => {
          if (!chunk || chunk.length === 0) {
            this.query().insert(data).then(resolve).catch(reject)
          }
        })
        .catch(reject)
    })
  }

  /**
   * Fires before insert in the DB
   */
  $beforeInsert () {
    this.createdAt = new Date()
  }
}

export default ChunkModel
