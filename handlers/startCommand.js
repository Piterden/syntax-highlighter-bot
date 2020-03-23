import Telegraf from 'telegraf'

import { debug, sleep } from '../helpers'
import { messages } from '../src/config/messages.mjs'

const { Markup } = Telegraf
const { MESSAGES_TIMEOUT } = process.env

export default async (ctx) => {
  // ctx.reply('fix')
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(
      messages.welcomeUser(ctx.state.user || ctx.from),
      { ...Markup.removeKeyboard().extra(), disable_web_page_preview: true }
    ).catch(debug)
    return
  }
  const message = await ctx.replyWithMarkdown(
    messages.themeGroup,
    { ...Markup.removeKeyboard().extra(), disable_web_page_preview: true }
  ).catch(debug)

  await sleep(MESSAGES_TIMEOUT)
  ctx.deleteMessage(message.message_id)
}
