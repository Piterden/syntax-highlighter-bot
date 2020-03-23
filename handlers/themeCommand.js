import Telegraf from 'telegraf'

import { debug, sleep } from '../helpers/index.js'
import { messages, themes } from '../src/config/messages.mjs'

const { Markup } = Telegraf
const { MESSAGES_TIMEOUT } = process.env

export default async (ctx) => {
  // ctx.reply('fix')
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(
      messages.themeChoose(ctx.state.user ? ctx.state.user.theme : {}),
      Markup.keyboard(messages.themesKeyboard(themes))
        .oneTime()
        .resize()
        .extra()
    ).catch(debug)
    return
  }
  const message = await ctx.replyWithMarkdown(messages.themeGroup)
    .catch(debug)

  await sleep(MESSAGES_TIMEOUT)
  ctx.deleteMessage(message.message_id)
}
