/* eslint-disable no-console */
import Knex from 'knex'
import webshot from 'webshot'
import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'

import dbConfig from '../knexfile'
import { webshotOptions, ENV } from './config/config'
import { messages, themes, langs } from './config/messages'
import { getPath, getUserPath, getThemeSlug, getThemeName, getImageFileName,
  isExisted, getFileURL, getPhotoData, isPrivateChat, chatUser, themesKeyboard,
  replyWithPhoto, onError, clearFolder } from './config/methods'

import Server from './server'

import UserModel from './model/User/user-model'
import ChatModel from './model/Chat/chat-model'
import ChunkModel from './model/Chunk/chunk-model'


const knex = Knex(dbConfig[ENV.NODE_ENV])

ChatModel.knex(knex)
UserModel.knex(knex)
ChunkModel.knex(knex)

const server = new Server(new Telegraf(ENV.BOT_TOKEN, {
  telegram: { webhookReply: true },
}))

/**
 * Log middleware
 */
server.bot.use((ctx, next) => {
  const start = Date.now()

  return next(ctx).then(() => {
    console.log(`
${JSON.stringify(ctx.message, null, '  ')}
----------------------------------------
${JSON.stringify(ctx.from, null, '  ')}
----------------------------------------
Response time ${Date.now() - start}ms
========================================`)
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
server.bot.start((ctx) => isPrivateChat(ctx) && ctx.replyWithMarkdown(
  messages.welcomeUser(ctx.state.user || chatUser(ctx)),
  { ...Markup.removeKeyboard().extra(), disable_web_page_preview: true }
))

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
  const themeSlug = getThemeSlug(ctx.match[1])
  const themeName = getThemeName(themeSlug)

  if (!themes.includes(themeSlug)) return false

  const body = messages.demoCode(themeName)
  const filePath = getPath(getImageFileName(body, themeSlug))

  return webshot(messages.getHtml(body, themeSlug), filePath, webshotOptions, (err) => {
    if (err) return console.log(err)

    const button = Markup.callbackButton(
      `Apply ${themeName} theme`,
      `/apply/${themeSlug}`
    )

    ctx.replyWithChatAction('upload_photo')

    return ctx.replyWithPhoto(
      { url: getFileURL(filePath) },
      Markup.inlineKeyboard([button]).extra()
    )
  })
})

/**
 * Save theme
 */
server.bot.action(/^\/apply\/(.+)$/, (ctx) => UserModel.applyTheme(
  chatUser(ctx),
  getThemeName(ctx.match[1]),
  (user) => {
    ctx.answerCbQuery()
    ctx.replyWithMarkdown(
      messages.themeChanged(user),
      Markup.removeKeyboard().extra()
    )
  }
))

/**
 * Catch code message
 */
server.bot.entity(({ type }) => type === 'pre', (ctx) => {
  let lang
  let full
  const entity = ctx.message.entities.find((ent) => ent.type === 'pre')
  let code = ctx.message.text.slice(entity.offset, entity.offset + entity.length)
  const match = code.match(/^(\w+)\n/)
  const themeSlug = ctx.state && ctx.state.user ? ctx.state.user.theme : 'github'

  if (match && match[1] && langs.includes(match[1])) {
    [full, lang] = match
    code = code.replace(new RegExp(full, 'i'), '')
  }
  else {
    lang = 'auto'
  }

  const html = messages.getHtml(code, themeSlug, lang !== 'auto' && lang)
  const filename = getImageFileName(html, themeSlug)
  const imagePath = getUserPath(ctx, filename)

  ChunkModel.store({
    userId: ctx.state && ctx.state.user.id,
    chatId: ctx.chat.id,
    filename,
    lang,
    source: code,
  }, () => {})

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
server.bot.on('inline_query', (ctx) => {
  let code = ctx.update.inline_query.query
  const match = code.match(/^(\w+)\n/)
  let lang = match && match[1]
  const theme = ctx.state && ctx.state.user ? ctx.state.user.theme : 'github'

  clearFolder(ctx.state && ctx.state.user)

  if (match && langs.includes(lang)) {
    code = code.replace(new RegExp(match[0], 'i'), '')
  }
  else {
    lang = undefined
  }

  const html = messages.getHtml(code, theme, lang)
  const imagePath = getUserPath(ctx, getImageFileName(html, theme))

  if (isExisted(imagePath)) {
    return ctx.answerInlineQuery([getPhotoData(imagePath)])
  }

  // console.log(html, imagePath, webshotOptions)

  return webshot(html, imagePath, webshotOptions, (err) => {
    if (err) return console.log(err)

    return ctx.answerInlineQuery([getPhotoData(imagePath.replace(
      '/home/dev812/web/syntax-highlighter-bot/images/',
      ''
    ))])
  })
})
// ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

/**
 * Bot was added to a group
 */
server.bot.on(['new_chat_members'], (ctx) => {
  if (ctx.message.new_chat_member.username !== ENV.BOT_USER) return

  const onSuccess = () => ctx.replyWithMarkdown(messages.welcomeGroup())

  ChatModel.query()
    .findById(ctx.chat.id)
    .then((chat) => chat
      ? ChatModel.query()
        .patchAndFetchById(chat.id, { active: true })
        .then(onSuccess)
        .catch(onError)
      : ChatModel.query()
        .insert({
          id: ctx.chat.id,
          title: ctx.chat.title,
          type: ctx.chat.type,
          active: true,
        })
        .then(onSuccess)
        .catch(onError))
    .catch(onError)
})

/**
 * Bot was removed from group
 */
server.bot.on(['left_chat_member'], (ctx) => {
  if (ctx.message.left_chat_member.username !== ENV.BOT_USER) return

  ChatModel.query()
    .patchAndFetchById(ctx.chat.id, { active: false })
    .then()
    .catch(onError)
})
