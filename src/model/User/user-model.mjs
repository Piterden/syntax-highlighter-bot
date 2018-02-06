import Objection from 'objection'
import Markup from 'telegraf/markup'
import { messages } from '../../config/messages'
import { chatUser, makeUserFolder, onError, getThemeName } from '../../config/methods'


const { Model, snakeCaseMappers } = Objection

class UserModel extends Model {
  /**
   * The DB table name
   *
   * @static
   * @return {string}
   */
  static get tableName() {
    return 'users'
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
   * @return {EagerAlgorithm}
   */
  static get defaultEagerAlgorithm() {
    return Model.JoinEagerAlgorithm
  }

  /**
   * JSON schema getter
   *
   * @static
   * @return {Object}
   */
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'username'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        languageCode: { type: 'string', maxLength: 2, default: 'en' },
        isBot: { type: 'boolean' },
        theme: { type: 'string', maxLength: 40, default: 'github' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
      },
    }
  }

  /**
   * Stores the user
   * @param ctx
   * @param next
   */
  static store(ctx, next) {
    const chatUserData = chatUser(ctx)

    this.query()
      .findById(chatUserData.id)
      .then((user) => {
        if (user) {
          ctx.state.user = user
          return next(ctx)
        }
        return (
          this.query()
            .insert({ ...chatUserData, theme: 'github' })
            // eslint-disable-next-line no-shadow
            .then((user) => {
              ctx.state.user = user
              makeUserFolder(user)
              next(ctx)
            })
            .catch(onError)
        )
      })
      .catch(onError)
  }

  static applyTheme({ id }, theme, cb) {
    this.query()
      .patchAndFetchById(id, { theme })
      .then(cb)
      .catch(onError)
  }

  $beforeInsert() {
    this.createdAt = new Date()
  }

  $beforeUpdate() {
    this.updatedAt = new Date()
  }
}

export default UserModel
