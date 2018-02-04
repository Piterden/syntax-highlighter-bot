import https from 'https'
import express from 'express'

import { tlsOptions, url, ENV } from './config/config'


const { WEBHOOK_DOMAIN, WEBHOOK_PATH, WEBHOOK_PORT, IMAGES_DIR } = ENV

export default class Server {
  constructor(bot) {
    const server = express()

    server.use(bot.webhookCallback(`/${WEBHOOK_PATH}`))
    server.use(`/${IMAGES_DIR}`, express.static(IMAGES_DIR))

    // server.post(`/${WEBHOOK_PATH}`, (req, res) => bot.handleUpdate(req.body, res))

    bot.telegram.setWebhook(`${url}${WEBHOOK_PATH}`, tlsOptions.cert)
    https.createServer(tlsOptions, server).listen(WEBHOOK_PORT, WEBHOOK_DOMAIN)

    this.express = server
    this.https = https
    this.bot = bot
  }
}
