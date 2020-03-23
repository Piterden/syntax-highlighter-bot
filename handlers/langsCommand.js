import { debug, sleep } from '../helpers/index.js'
import { messages } from '../src/config/messages.mjs'

const { MESSAGES_TIMEOUT } = process.env

export default async (ctx) => {
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(messages.langsList()).catch(debug)
    return
  }
  const message = await ctx.replyWithMarkdown(messages.themeGroup)
    .catch(debug)

  await sleep(MESSAGES_TIMEOUT)
  ctx.deleteMessage(message.message_id)
}
