import Objection from 'objection'
import Markup from 'telegraf/markup'
import { messages } from '../../config/messages'
import { chatUser, makeUserFolder, onError } from '../../support/utils'


const { Model, snakeCaseMappers } = Objection

class UserModel extends Model {
  static get tableName() {
    return 'users'
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
      required: ['id', 'username'],
      properties: {
        id: { type: 'integer' },
        firstName: { type: 'string', maxLength: 255 },
        lastName: { type: 'string', maxLength: 255 },
        username: { type: 'string', minLength: 1, maxLength: 255 },
        languageCode: { type: 'string', maxLength: 2, default: 'en' },
        theme: { type: 'string', maxLength: 40, default: 'github' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' },
      },
    }
  }

  static store(ctx, next) {
    const chatUserData = chatUser(ctx)

    this.query().findById(chatUserData.id)
      .then((user) => {
        if (user) {
          ctx.state.user = user
          return next(ctx)
        }
        return this.query().insert({ ...chatUserData, theme: 'github' })
          // eslint-disable-next-line no-shadow
          .then((user) => {
            ctx.state.user = user
            makeUserFolder(user)
            next(ctx)
          })
          .catch(onError)
      })
      .catch(onError)
  }

  static applyTheme(ctx) {
    const chatUserData = chatUser(ctx)

    this.query().patchAndFetchById(chatUserData.id, { theme: ctx.match[1] })
      .then((user) => {
        ctx.answerCbQuery()
        ctx.replyWithMarkdown(
          messages.themeChanged(user),
          Markup.removeKeyboard().extra()
        )
      })
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
