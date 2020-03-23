/* global document */

import Knex from 'knex'
import dotenv from 'dotenv'
import Telegraf from 'telegraf'
import puppeteer from 'puppeteer'

import dbConfig from './knexfile.js'
import { debug, sleep } from './helpers/index.js'
import { languages } from './src/config/config.mjs'
import { messages, themes, langs } from './src/config/messages.mjs'
import { replyWithPhoto, replyWithMediaGroup } from './src/config/methods.mjs'
import { startCommand, langsCommand, themeCommand } from './handlers/index.js'

dotenv.load()

const { Markup } = Telegraf
const { NODE_ENV, BOT_USER, BOT_TOKEN, MESSAGES_TIMEOUT } = process.env
const knex = Knex(dbConfig[NODE_ENV])

/**
 * Gets the property value.
 *
 * @param {ElementHandle|JSHandle} el Element
 * @param {String} propName The property name
 * @return {String} The property value.
 */
const getPropertyValue = async (el, propName) => {
  const prop = await el.getProperty(propName)
  const value = await prop.jsonValue()

  return value
}

const langsConfig = Object.keys(languages).reduce((result, key) => {
  const { ace_mode: lang, aliases = [], extensions = [] } = languages[key];

  [...aliases, ...extensions].forEach((name) => {
    result[name] = lang
  })

  return result
}, {})

/**
 * Run main programm
 */
const run = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  })
  const bot = new Telegraf(BOT_TOKEN, { username: BOT_USER })

  bot.context.db = knex

  bot.command('/start', startCommand)
  bot.command('/start@cris_highlight_bot', startCommand)

  bot.command('/langs', langsCommand)
  bot.command('/langs@cris_highlight_bot', langsCommand)

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
            lang = lang === 'c_cpp' ? 'cpp' : lang
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
        const page = await browser.newPage()

        await page.evaluate((markup) => {
          document.write(markup)
        }, html)
        const code = await page.$('#code')
        const buffer = await code.screenshot()

        await page.close()
        return buffer
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
}

run()
