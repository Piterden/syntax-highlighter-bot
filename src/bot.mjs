import fs from 'fs'
import path from 'path'
import Knex from 'knex'
import https from 'https'
import crypto from 'crypto'
import dotenv from 'dotenv'
import express from 'express'
import webshot from 'webshot'
// import sizeOf from 'image-size'
import Telegraf from 'telegraf'
// import highlight from 'highlight.js'
import Markup from 'telegraf/markup'

// import rimraf from 'rimraf'
// import bodyParser from 'body-parser'
// import Objection from 'objection'

import dbConfig from '../knexfile'
import messages from './config/messages'
import { themes, langs } from './config/messages'

// import UseModel from './model/Use/UseModel'
import UserModel from './model/User/UserModel'
import ChatModel from './model/Chat/ChatModel'

const _env = dotenv.config().parsed

const tlsOptions = {
  key: fs.readFileSync(path.resolve(_env.WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(_env.WEBHOOK_CERT)),
}

const url = `https://${_env.WEBHOOK_DOMAIN}:${_env.WEBHOOK_PORT}/`

// const getBody = (path) => fs.readFileSync(path)

const md5 = (string) => crypto.createHash('md5').update(string).digest('hex')

const getPath = (file) => path.resolve(`images/${file}`)

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

// const isExisted = (file) => fs.existsSync(file)

const getFileURL = (file) => `${url}${file.match(/(images\/.+)$/)[1] || file}`

// const getImageWidth = (file) => sizeOf(getPath(file)).width

// const getImageHeight = (file) => sizeOf(getPath(file)).height

// const getPhotoData = (file, idx = null) => ({
//   'type': 'photo',
//   'photo_url': getFileURL(file),
//   'thumb_url': getFileURL(file),
//   'photo_width': getImageWidth(file),
//   'photo_height': getImageHeight(file),
//   'id': file + (idx || ''),
// })

// const htmlhighlight = (body, lang) => lang
//   ? highlight.highlight(lang, body).value
//   : highlight.highlightAuto(body).value

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

const onError = (err) => console.log(err)

const webshotOptions = {
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
}

const knex = Knex(dbConfig.development)
ChatModel.knex(knex)
UserModel.knex(knex)

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
  if (ctx.state.user) {
    return next(ctx)
  }
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
          // return next(ctx)
        })
        .catch((err) => {
          console.log(err)
          // return next(ctx)
        })
    })
    .catch((err) => {
      console.log(err)
      // return next(ctx)
    })
})

/**
 * Start bot command
 */
bot.start((ctx) => {
  if (isPrivateChat(ctx)) {
    return ctx.replyWithMarkdown(
      messages.welcomeUser(ctx.state.user),
      Markup.removeKeyboard().extra()
    )
  }
})

/**
 * Show languages list
 */
bot.command('langs', (ctx) => {
  if (isPrivateChat(ctx)) {
    return ctx.replyWithMarkdown(messages.langsList(langs))
  }
  return ctx.reply(messages.themeGroup)
})

/**
 * Show themes list
 */
bot.command('theme', (ctx) => {
  if (isPrivateChat(ctx)) {
    return ctx.replyWithMarkdown(
      messages.themeChoose(ctx.state.user.theme),
      Markup.keyboard(themesKeyboard(themes)).oneTime().resize().extra()
    )
  }
  return ctx.reply(messages.themeGroup)
})

/**
 * Theme choose command
 */
bot.hears(/^🎨 (.+)/, (ctx) => {
  const theme = getThemeSlug(ctx.match[1])
  if (!themes.includes(theme)) {
    return
  }
  const body = messages.demoCode(getThemeName(theme))
  const filePath = getPath(getImageFileName(body, theme))

  webshot(messages.getHtml(body, theme), filePath, webshotOptions, (err) => {
    if (err) {
      return console.log(err)
    }
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
bot.action(/^\/apply\/(.+)$/, (ctx) => {
  return UserModel.query()
    .patchAndFetchById(chatUser(ctx).id, { theme: ctx.match[1] })
    .then((user) => {
      ctx.answerCbQuery()
      ctx.replyWithMarkdown(
        messages.themeChanged(user),
        Markup.removeKeyboard().extra()
      )
    })
    .catch(onError)
})

/**
 * Bot was added to a group
 */
bot.on(['new_chat_members'], (ctx) => {
  if (ctx.message.new_chat_member.username !== _env.BOT_USER) {
    return
  }
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
  if (ctx.message.left_chat_member.username !== _env.BOT_USER) {
    return
  }
  ChatModel.query()
    .patchAndFetchById(ctx.chat.id, { active: false })
    .then()
    .catch(onError)
})

/**
 * Catch code message
 */
bot.entity(({ type }) => type === 'pre', (ctx) => {
  const entity = ctx.message.entities.find((ent) => ent.type === 'pre')
  let code = ctx.message.text.slice(entity.offset, entity.offset + entity.length)
  const match = code.match(/^(\w+)\n/)
  const lang = match && match[1]

  if (match && langs.includes(lang)) {
    code = code.replace(new RegExp(match && match[0], 'i'), '')
  }

  const theme = ctx.state.user && ctx.state.user.theme || 'github'
  const html = messages.getHtml(code, theme, lang)
  const filePath = getPath(
    getImageFileName(html, theme)
  )

  webshot(html, filePath, webshotOptions, (err) => {
    if (err) {
      return console.log(err)
    }
    ctx.replyWithChatAction('upload_photo')
    return ctx.replyWithPhoto(
      { url: getFileURL(filePath) },
      Markup.removeKeyboard().extra()
    )
  })
})

// bot.on('inline_query', (ctx) => {
//   ctx.answerInlineQuery([1,2,3])


//   // ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)
// })


// http.createServer(function (request, response) {
//   console.log(JSON.stringify(request.headers))

//   if (request.method.toLowerCase() !== 'post') {
//     response.writeHead(404, { 'Content-Type': 'text/plain' })
//     response.write('ERROR Petición no válida\n')
//     response.end()
//     return
//   }

//   let body = ''

//   request.on('data', function (data) {
//     body += data
//     // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
//     if (body.length > 1e6) {
//       // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
//       request.connection.destroy()
//     }
//   })

//   request.on('end', function () {
//     request.headers.recent = request.headers.recent || ''

//     if (!body && request.headers.inline) {
//       console.log('INLINE VACIO')
//       bot.answerInlineQuery(
//         request.headers.inline,
//         request.headers.recent.split(',').filter(isExisted).map(getPhotoData),
//         { 'is_personal': true, 'cache_time': 0 }
//       )
//       return
//     }

//     const fileName = `${md5(body)}_${request.headers.theme}.jpg`

//     const htmlhighlight = !request.headers.lang
//       ? highlight.highlightAuto(body)
//       : highlight.highlight(request.headers.lang, body)

//     let sendPhotoOptions

//     if (!request.headers.inline) {
//       sendPhotoOptions = { 'reply_to_message_id': request.headers.messageid }
//       if (request.headers.demo == 1) {
//         sendPhotoOptions['reply_markup'] = {
//           'inline_keyboard': [[{
//             'text': 'Apply theme',
//             'callback_data': request.headers.theme,
//           }]],
//         }
//       }
//     }

//     if (fs.existsSync(getPath(fileName))) {
//       if (request.headers.inline) {
//         bot.answerInlineQuery(
//           request.headers.inline,
//           [getPhotoData(getPath(fileName))]
//             .concat(
//               request.headers.recent.split(',')
//                 .filter(isExisted)
//                 .map(getPhotoData)
//             ),
//           { 'is_personal': true, 'cache_time': 0 }
//         )
//         return
//       }

//       bot.sendChatAction(request.headers.chatid, 'upload_photo')
//       bot.sendPhoto(request.headers.chatid, getPath(fileName), sendPhotoOptions)

//       response.writeHead(200, { 'Content-Type': 'text/plain' })
//       response.write(fileName)
//       console.log(fileName)
//       response.end()
//       return
//     }

//     if (!(htmlhighlight.relevance > 7 || request.headers.lang)) {
//       response.writeHead(404, { 'Content-Type': 'text/plain' })
//       response.write('ERROR Sin relevancia\n')
//       response.end()

//       const uploadsDir = __dirname + '/images'

//       fs.readdir(uploadsDir, function (err, files) {
//         files.forEach(function (file) {
//           fs.stat(path.join(uploadsDir, file), function (err, stat) {
//             let endTime, now
//             if (err) {
//               return console.error(err)
//             }
//             now = new Date().getTime()
//             endTime = new Date(stat.ctime).getTime() + 3600000
//             if (now > endTime) {
//               return rimraf(path.join(uploadsDir, file), function (err) {
//                 if (err) {
//                   return console.error(err)
//                 }
//                 console.log('successfully deleted')
//               })
//             }
//           })
//         })
//       })
//       return
//     }

//     fs.readFile(
//       path.join(__dirname, `node_modules/highlight.js/styles/${request.headers.theme}.css`),
//       'utf8',
//       (err, data) => {
//         if (err) {
//           response.writeHead(404, { 'Content-Type': 'text/plain' })
//           response.write('ERROR al leer estilo\n')
//           response.end()
//         }

//         const html = `
// <html lang="en">
// <head>
// <style>
// ::-webkit-scrollbar {
//   display: none;
// }
// ${data}
// </style>
// </head>
// <body style="display: inline-block;">
// <pre style="max-width:1400px">
// <code class="hljs" id="code"
//   style="white-space:pre-wrap;font-size:12pt;font-family:'Inconsolata'"
// >${htmlhighlight.value}</code>
// </pre>
// </body>
// </html>
// `
//         webshot(
//           html,
//           getPath(fileName),
//           {
//             siteType: 'html',
//             captureSelector: '#code',
//             quality: 100,
//             shotSize: { width: 'all', height: 'all' },
//           },
//           (err) => {
//             if (err) {
//               response.writeHead(404, { 'Content-Type': 'text/plain' })
//               response.write('ERROR al generar imagen\n')
//               response.end()
//               return
//             }

//             if (request.headers.inline) {
//               bot.answerInlineQuery(
//                 request.headers.inline,
//                 [getPhotoData(getPath(fileName))]
//                   .concat(
//                     request.headers.recent.split(',')
//                       .filter(isExisted)
//                       .map(getPhotoData)
//                   ),
//                 { 'is_personal': true, 'cache_time': 0 }
//               )
//               return
//             }

//             bot.sendChatAction(request.headers.chatid, 'upload_photo')
//             bot.sendPhoto(request.headers.chatid, getPath(fileName), sendPhotoOptions)

//             response.writeHead(200, { 'Content-Type': 'text/plain' })
//             response.write(fileName)
//             console.log(fileName)
//             response.end()

//             return
//           }
//         )
//       }
//     )
//   })
// }).listen(parseInt(8888, 10))

// console.log('HightlightNode server running at\n  => http://localhost:8888/\nCtrl + C to shutdown')
