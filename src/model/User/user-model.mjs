import Objection from 'objection'
import { chatUser, makeUserFolder, onError } from '../../config/methods'

const { Model, snakeCaseMappers } = Objection

const unescapeUser = (user) => Object.keys(user).reduce((acc, key) => {
  acc[key] = key !== 'id' ? unescape(user[key]) : Number(user[key])
  return acc
}, {})

class UserModel extends Model {
  /**
   * The DB table name
   *
   * @static
   * @return {string}
   */
  static get tableName () {
    return 'users'
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
   * @return {EagerAlgorithm}
   */
  static get defaultEagerAlgorithm () {
    return Model.JoinEagerAlgorithm
  }

  /**
   * JSON schema getter
   *
   * @static
   * @return {Object}
   */
  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        username: { type: 'string', maxLength: 255 },
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
   *
   * @param ctx
   * @param next
   */
  static store (ctx, next) {
    const chatUserData = chatUser(ctx)

    this.query()
      .findById(+chatUserData.id)
      .then((user) => {
        if (user) {
          ctx.state.user = unescapeUser(user)
          return next(ctx)
        }
        const { id, ...data } = chatUserData

        return (
          this.query()
            .insert({ id: +id, ...data, theme: 'github' })
            // eslint-disable-next-line no-shadow
            .then((user) => {
              ctx.state.user = unescapeUser(user)
              makeUserFolder(user)
              next(ctx)
            })
            .catch(onError)
        )
      })
      .catch(onError)
  }

  static applyTheme ({ id }, theme, callback) {
    this.query()
      .patchAndFetchById(+id, { theme })
      .then(callback)
      .catch(onError)
  }

  $beforeInsert () {
    this.createdAt = new Date()
  }

  $beforeUpdate () {
    this.updatedAt = new Date()
  }
}

export default UserModel
