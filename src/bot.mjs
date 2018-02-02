/* eslint-disable no-console */
import Knex from 'knex'
import webshot from 'webshot'
import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'

import dbConfig from '../knexfile'
import Server from './server'
import { messages, themes, langs } from './config/messages'
import { webshotOptions, ENV } from './config/config'

import { getPath, /* getTempPath,  */getThemeSlug, getThemeName, getImageFileName,
  isExisted, getFileURL, /* getPhotoData,  */isPrivateChat, chatUser, themesKeyboard,
  replyWithPhoto, onError } from './config/methods'

import UserModel from './model/User/user-model'
import ChatModel from './model/Chat/chat-model'
import ChunkModel from './model/Chunk/chunk-model'


// const { IMAGES_DIR, NODE_ENV, BOT_TOKEN }
const knex = Knex(dbConfig[ENV.NODE_ENV])

ChatModel.knex(knex)
UserModel.knex(knex)
ChunkModel.knex(knex)

const server = new Server(new Telegraf(ENV.BOT_TOKEN, {
  telegram: {
    webhookReply: true,
  },
}))

/**
 * Log middleware
 */
server.bot.use((ctx, next) => {
  const start = new Date()

  return next(ctx).then(() => {
    console.log(ctx.message)
    console.log()
    console.log()
    console.log(ctx.from)
    console.log()
    console.log(`Response time ${(new Date()) - start}ms`)
    console.log('\n----------------------------------------\n')
  })
})

/**
 * User middleware
 */
server.bot.use((ctx, next) => ctx.state.user
  ? next(ctx)
  : UserModel.store(ctx, next))

/**
 * Start bot command
 */
server.bot.start((ctx) => isPrivateChat(ctx) && ctx.reply(
  messages.welcomeUser(ctx.state.user || chatUser(ctx)),
  Markup.removeKeyboard().extra()
).then(() => console.log('success')).catch((error) => console.log(error)))

/**
 * Show languages list
 */
server.bot.command('langs', (ctx) => isPrivateChat(ctx)
  ? ctx.replyWithMarkdown(messages.langsList())
  : ctx.reply(messages.themeGroup))

/**
 * Show themes list
 */
server.bot.command('theme', (ctx) => isPrivateChat(ctx)
  ? ctx.replyWithMarkdown(
    messages.themeChoose(ctx.state.user.theme),
    Markup.keyboard(themesKeyboard(themes)).oneTime().resize().extra()
  )
  : ctx.reply(messages.themeGroup))

/**
 * Theme choose command
 */
server.bot.hears(/^🎨 (.+)/, (ctx) => {
  const theme = getThemeSlug(ctx.match[1])

  if (!themes.includes(theme)) return

  const body = messages.demoCode(getThemeName(theme))
  const filePath = getPath(getImageFileName(body, theme))

  webshot(messages.getHtml(body, theme), filePath, webshotOptions, (err) => {
    if (err) return console.log(err)

    ctx.replyWithChatAction('upload_photo')
    return ctx.replyWithPhoto(
      { url: getFileURL(filePath) },
      Markup
        .inlineKeyboard([
          Markup.callbackButton('Apply theme', `/apply/${theme}`),
        ])
        .removeKeyboard()
        .extra()
    )
  })
})

/**
 * Save theme
 */
server.bot.action(/^\/apply\/(.+)$/, (ctx) => UserModel.applyTheme(ctx))

/**
 * Catch code message
 */
server.bot.entity(({ type }) => type === 'pre', (ctx) => {
  const entity = ctx.message.entities.find((ent) => ent.type === 'pre')

  let code = ctx.message.text.slice(entity.offset, entity.offset + entity.length)
  const match = code.match(/^(\w+)\n/)
  const theme = ctx.state.user ? ctx.state.user.theme : 'github'
  const lang = match && match[1]

  if (match && langs.includes(lang)) {
    code = code.replace(new RegExp(match && match[0], 'i'), '')
  }

  const html = messages.getHtml(code, theme, lang)
  const imagePath = getPath(getImageFileName(html, theme))

  ChunkModel.store(ctx, {
    filename: getImageFileName(html, theme),
    lang: lang || 'auto',
    source: code,
  })

  if (isExisted(imagePath)) {
    return replyWithPhoto(ctx, imagePath)
  }

  webshot(html, imagePath, webshotOptions, (err) => err
    ? console.log(err)
    : replyWithPhoto(ctx, imagePath))

  return true
})

/**
 * Inline query
 */
// bot.on('inline_query', (ctx) => {
//   let code = ctx.update.inline_query.query
//   const match = code.match(/^(\w+)\n/)
//   const lang = match && match[1]
//   const theme = ctx.state && ctx.state.user ? ctx.state.user.theme : 'github'

//   if (match && langs.includes(lang)) {
//     code = code.replace(new RegExp(match[0], 'i'), '')
//   }

//   const html = messages.getHtml(code, theme, lang)
//   const imagePath = getTempPath(getImageFileName(html, theme))

//   if (isExisted(imagePath)) {
//     return ctx.answerInlineQuery([getPhotoData(imagePath)])
//   }

//   console.log(html, imagePath, webshotOptions)

//   webshot(html, imagePath, webshotOptions, (err) => err
//     ? console.log(err)
//     : ctx.answerInlineQuery([getPhotoData(imagePath)]))

//   return true
// })
// ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

/**
 * When the bot would be added to a group
 */
server.bot.on(['new_chat_members'], (ctx) => {
  if (ctx.message.new_chat_member.username !== ENV.BOT_USER) return

  const onSuccess = () => ctx.replyWithMarkdown(messages.welcomeGroup())

  ChatModel.create(ctx, {}, onSuccess, onError)
})

/**
 * WHen the bot would be removed from a group
 */
server.bot.on(['left_chat_member'], (ctx) => {
  if (ctx.message.left_chat_member.username !== ENV.BOT_USER) return

  ChatModel.query()
    .patchAndFetchById(ctx.chat.id, { active: false })
    .then()
    .catch(onError)
})
