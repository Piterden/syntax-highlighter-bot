import Knex from 'knex'
import dotenv from 'dotenv'
import Telegraf from 'telegraf'
import puppeteer from 'puppeteer'

import dbConfig from './knexfile.js'
import { debug, sleep } from './helpers/index.js'
import { languages } from './src/config/config.mjs'
import { messages, themes, langs } from './src/config/messages.mjs'
import { replyWithPhoto, replyWithMediaGroup } from './src/config/methods.mjs'
import {
  langsCommand,
  removeAction,
  startCommand,
  themeCommand,
  entityHandler,
} from './handlers/index.js'

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
  bot.entity(...entityHandler(browser))
  bot.action(...removeAction())

  bot.launch()
}

run()
