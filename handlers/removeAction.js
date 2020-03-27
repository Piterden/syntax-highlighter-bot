/**
 * Handle remove action.
 */
export default () => [/^remove::(\d+)(?:::([\d|]+))?$/, async (ctx) => {
  ctx.answerCbQuery()
  if (Number(ctx.match[1]) === ctx.update.callback_query.from.id) {
    if (ctx.match[2]) {
      ctx.match[2].split('|').forEach((id) => {
        ctx.telegram.deleteMessage(
          ctx.update.callback_query.message.chat.id,
          Number(id)
        )
      })
    }
    await ctx.telegram.deleteMessage(
      ctx.update.callback_query.message.chat.id,
      ctx.update.callback_query.message.message_id
    )
    ctx.answerCbQuery(`Message${ctx.match[2] ? 's' : ''} removed.`)
    return
  }
  ctx.answerCbQuery('Sorry. Only author and admins are allowed to remove messages!')
}]
