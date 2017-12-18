import fs from 'fs'
import path from 'path'
import Knex from 'knex'
import https from 'https'
import crypto from 'crypto'
import dotenv from 'dotenv'
import express from 'express'
import webshot from 'webshot'
import sizeOf from 'image-size'
import Telegraf from 'telegraf'
import Markup from 'telegraf/markup'

import dbConfig from '../knexfile'
import messages from './config/messages'
import { themes, langs } from './config/messages'

import UserModel from './model/User/UserModel'
import ChatModel from './model/Chat/ChatModel'
import ChunkModel from './model/Chunk/ChunkModel'

const _env = dotenv.config().parsed

const tlsOptions = {
  key: fs.readFileSync(path.resolve(_env.WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(_env.WEBHOOK_CERT)),
}

const webshotOptions = {
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
}

const url = `https://${_env.WEBHOOK_DOMAIN}:${_env.WEBHOOK_PORT}/`

const md5 = (string) =>
  crypto.createHash('md5').update(string).digest('hex')

const getPath = (file) =>
  path.resolve(`images/${file}`)

const getTempPath = (ctx, file) =>
  path.resolve(`images/${ctx.state.user.id}/${file}`)

const getThemeSlug = (name) => name
  .split(' ')
  .map((word) => word.toLowerCase())
  .join('-')

const getThemeName = (slug) => slug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

const getImageFileName = (body, theme) =>
  `${md5(body)}_${getThemeSlug(theme)}.jpg`

const isExisted = (file) => fs.existsSync(file)

const filenameFix = (file) => {
  const match = file.match(/(images\/.+)$/)
  return match && match[1] || file
}

const getFileURL = (file) => `${url}${filenameFix(file)}`

const getImageWidth = (file) => sizeOf(getPath(file)).width

const getImageHeight = (file) => sizeOf(getPath(file)).height

const getPhotoData = (file, idx = null) => ({
  'type': 'photo',
  'photo_url': getFileURL(file),
  'thumb_url': getFileURL(file),
  'photo_width': getImageWidth(file),
  'photo_height': getImageHeight(file),
  'id': file + (idx || ''),
})

const isPrivateChat = (ctx) => ctx.chat.type === 'private'

const chatUser = (ctx) => {
  if (!ctx.from) return false
  const user = { ...{}, ...ctx.from }
  delete user.is_bot
  return user
}

const themesKeyboard = (themes, cache = '') => themes
  .map((theme, idx) => {
    if ((idx + 1) % 2) {
      cache = `🎨 ${getThemeName(theme)}`
      return idx - 1 < themes.length ? false : cache
    }
    return [cache, `🎨 ${getThemeName(theme)}`]
  })
  .filter(Boolean)

const replyWithPhoto = (ctx, path) => {
  ctx.replyWithChatAction('upload_photo')
  return ctx.replyWithPhoto(
    { url: getFileURL(path) },
    Markup.removeKeyboard().extra()
  )
}

const makeUserFolder = (user) => {
  const filepath = path.resolve(`images/${user.id}`)
  if (isExisted(filepath)) return
  fs.mkdirSync(filepath)
}

const onError = (err) => console.log(err)

const knex = Knex(dbConfig.development)
ChatModel.knex(knex)
UserModel.knex(knex)
ChunkModel.knex(knex)

const storeChunk = (ctx, filename, source, lang) => {
  ChunkModel.query()
    .insert({
      filename,
      userId: ctx.state.user.id,
      chatId: ctx.chat.id,
      lang,
      source,
    })
    .then()
    .catch(onError)
}

const server = express()
const bot = new Telegraf(_env.BOT_TOKEN, { telegram: { webhookReply: true } })

server.use(bot.webhookCallback(`/${_env.WEBHOOK_PATH}`))

server.use('/images', express.static('images'))

server.post(
  `/${_env.WEBHOOK_PATH}`,
  (req, res) => bot.handleUpdate(req.body, res)
)

// Set telegram webhook
bot.telegram.setWebhook(`${url}${_env.WEBHOOK_PATH}`, tlsOptions.cert)

// Start Express Server
https
  .createServer(tlsOptions, server)
  .listen(_env.WEBHOOK_PORT, _env.WEBHOOK_DOMAIN)

/**
 * Log middleware
 */
bot.use((ctx, next) => {
  const start = new Date()
  return next(ctx).then(() => {
    console.log(ctx.message)
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
bot.use((ctx, next) => {
  if (ctx.state.user) return next(ctx)

  UserModel.query()
    .findById(chatUser(ctx).id)
    .then(user => {
      if (user) {
        ctx.state.user = user
        return next(ctx)
      }
      UserModel.query()
        .insert({ ...chatUser(ctx), theme: 'github' })
        .then((user) => {
          ctx.state.user = user
          makeUserFolder(user)
          return next(ctx)
        })
        .catch(onError)
    })
    .catch(onError)
})

/**
 * Start bot command
 */
bot.start((ctx) => isPrivateChat(ctx) && ctx.replyWithMarkdown(
  messages.welcomeUser(ctx.state.user || chatUser(ctx)),
  Markup.removeKeyboard().extra()
))

/**
 * Show languages list
 */
bot.command('langs', (ctx) => isPrivateChat(ctx)
  ? ctx.replyWithMarkdown(messages.langsList())
  : ctx.reply(messages.themeGroup)
)

/**
 * Show themes list
 */
bot.command('theme', (ctx) => isPrivateChat(ctx)
  ? ctx.replyWithMarkdown(
    messages.themeChoose(ctx.state.user.theme),
    Markup.keyboard(themesKeyboard(themes)).oneTime().resize().extra()
  )
  : ctx.reply(messages.themeGroup)
)

/**
 * Theme choose command
 */
bot.hears(/^🎨 (.+)/, (ctx) => {
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
bot.action(/^\/apply\/(.+)$/, (ctx) => UserModel.query()
  .patchAndFetchById(chatUser(ctx).id, { theme: ctx.match[1] })
  .then((user) => {
    ctx.answerCbQuery()
    ctx.replyWithMarkdown(
      messages.themeChanged(user),
      Markup.removeKeyboard().extra()
    )
  })
  .catch(onError)
)

/**
 * Catch code message
 */
bot.entity(({ type }) => type === 'pre', (ctx) => {
  const entity = ctx.message.entities.find((ent) => ent.type === 'pre')

  let code = ctx.message.text.slice(entity.offset, entity.offset + entity.length)
  const match = code.match(/^(\w+)\n/)
  const theme = ctx.state.user && ctx.state.user.theme || 'github'
  const lang = match && match[1]

  if (match && langs.includes(lang)) {
    code = code.replace(new RegExp(match && match[0], 'i'), '')
  }

  const html = messages.getHtml(code, theme, lang)
  const imagePath = getPath(getImageFileName(html, theme))

  storeChunk(ctx, getImageFileName(html, theme), code, lang || 'auto')

  if (isExisted(imagePath)) {
    return replyWithPhoto(ctx, imagePath)
  }

  webshot(html, imagePath, webshotOptions, (err) => {
    if (err) return console.log(err)
    return replyWithPhoto(ctx, imagePath)
  })
})

/**
 * Inline query
 */
bot.on('inline_query', (ctx) => {
  let code = ctx.update.inline_query.query
  const match = code.match(/^(\w+)\n/)
  const lang = match && match[1]
  const theme = ctx.state.user && ctx.state.user.theme || 'github'

  if (match && langs.includes(lang)) {
    code = code.replace(new RegExp(match && match[0], 'i'), '')
  }

  const html = messages.getHtml(code, theme, lang)
  const imagePath = getTempPath(getImageFileName(html, theme))

  if (isExisted(imagePath)) {
    return ctx.answerInlineQuery([getPhotoData(imagePath)])
  }

  webshot(html, imagePath, webshotOptions, (err) => {
    if (err) return console.log(err)
    return ctx.answerInlineQuery([getPhotoData(imagePath)])
  })
})
// ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

/**
 * Bot was added to a group
 */
bot.on(['new_chat_members'], (ctx) => {
  if (ctx.message.new_chat_member.username !== _env.BOT_USER) return

  const onSuccess = () => ctx.replyWithMarkdown(messages.welcomeGroup())

  ChatModel.query()
    .findById(ctx.chat.id)
    .then(chat => chat
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
        .catch(onError)
    )
    .catch(onError)
})

/**
 * Bot was removed from group
 */
bot.on(['left_chat_member'], (ctx) => {
  if (ctx.message.left_chat_member.username !== _env.BOT_USER) return

  ChatModel.query()
    .patchAndFetchById(ctx.chat.id, { active: false })
    .then()
    .catch(onError)
})
