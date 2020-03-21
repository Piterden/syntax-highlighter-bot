import Knex from 'knex'
import dotenv from 'dotenv'
import webshot from 'webshot'
import Telegraf from 'telegraf'

import dbConfig from './knexfile.js'
import { webshotOptions, languages } from './src/config/config.mjs'
import { messages, themes, langs } from './src/config/messages.mjs'
import {
  isExisted,
  getWebShot,
  getUserPath,
  replyWithPhoto,
  getImageFileName,
  replyWithMediaGroup,
} from './src/config/methods.mjs'

dotenv.load()

const { Markup } = Telegraf
const { NODE_ENV, BOT_TOKEN, BOT_USER } = process.env

const knex = Knex(dbConfig[NODE_ENV])

const langsConfig = Object.keys(languages).reduce((result, key) => {
  const { ace_mode: lang, aliases = [], extensions = [] } = languages[key];

  [...aliases, ...extensions].forEach((name) => {
    result[name] = lang
  })

  return result
}, {})

const bot = new Telegraf(BOT_TOKEN, { username: BOT_USER })

// bot.use((ctx, next) => ctx.state.user
//   ? next(ctx)
//   : UserModel.store(ctx, next))

/**
 * Start bot command
 */
const startCommand = async (ctx) => {
  // ctx.reply('fix')
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(
      messages.welcomeUser(ctx.state.user || ctx.from),
      { ...Markup.removeKeyboard().extra(), disable_web_page_preview: true }
    ).catch(console.error)
    return
  }
  const message = await ctx.replyWithMarkdown(
    messages.themeGroup,
    { ...Markup.removeKeyboard().extra(), disable_web_page_preview: true }
  ).catch(console.error)

  setTimeout(() => {
    ctx.deleteMessage(message.message_id)
  }, 10000)
}

bot.command('/start', startCommand)
bot.command('/start@cris_highlight_bot', startCommand)

/**
 * Show languages list
 */
const langsCommand = async (ctx) => {
  // ctx.reply('fix')
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(messages.langsList()).catch(console.error)
    return
  }
  const message = await ctx.replyWithMarkdown(messages.themeGroup)
    .catch(console.error)

  setTimeout(() => {
    ctx.deleteMessage(message.message_id)
  }, 10000)
}

bot.command('/langs', langsCommand)
bot.command('/langs@cris_highlight_bot', langsCommand)

/**
 * Show themes list
 */
const themeCommand = async (ctx) => {
  // ctx.reply('fix')
  if (ctx.chat.type === 'private') {
    await ctx.replyWithMarkdown(
      messages.themeChoose(ctx.state.user ? ctx.state.user.theme : {}),
      Markup.keyboard(messages.themesKeyboard(themes))
        .oneTime()
        .resize()
        .extra()
    ).catch(console.error)
    return
  }
  const message = await ctx.replyWithMarkdown(messages.themeGroup)
    .catch(console.error)

  setTimeout(() => {
    ctx.deleteMessage(message.message_id)
  }, 10000)
}

bot.command('/theme', themeCommand)
bot.command('/theme@cris_highlight_bot', themeCommand)

/**
 * Catch code message
 */
bot.entity(({ type }) => type === 'pre', async (ctx) => {
  const images = await Promise.all(ctx.message.entities
    .filter(({ type }) => type === 'pre')
    .map(async (entity) => {
      let lang
      let full
      let source = ctx.message.text.slice(entity.offset, entity.offset + entity.length)
      const match = source.match(/^(\w+)\n/)
      const themeSlug = ctx.state && ctx.state.user
        ? ctx.state.user.theme
        : 'Atom One Dark'

      if (match && match[1] && (langs.includes(match[1]) || match[1] === 'js')) {
        [full, lang] = match
        if (langsConfig[lang]) {
          lang = langsConfig[lang]
        }
        source = source.replace(new RegExp(full, 'i'), '')
      } else {
        lang = 'auto'
        source = source.replace(new RegExp('^\\n', 'i'), '')
      }

      const html = messages.getHtml(
        /* trimLines( */source.trim()/* ) */,
        themeSlug,
        lang !== 'auto' && lang
      )
      const filename = getImageFileName(html, themeSlug)
      let imagePath = getUserPath(ctx, filename)

      // await ChunkModel.store({
      //   userId: ctx.state && Number(ctx.state.user.id),
      //   chatId: Number(ctx.chat.id),
      //   filename,
      //   lang,
      //   source,
      // })

      if (!isExisted(imagePath)) {
        imagePath = await getWebShot(html, imagePath, webshotOptions)
          .catch(console.log)
      }

      return imagePath
    }))

  if (images.length === 0) {
    return
  }
  if (images.length === 1) {
    replyWithPhoto(ctx, images[0])
    return
  }
  replyWithMediaGroup(ctx, images)
})

bot.launch()
