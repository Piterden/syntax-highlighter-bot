import fs from 'graceful-fs'
import path from 'path'
import crypto from 'crypto'
import webshot from 'webshot'
import sizeOf from 'image-size'
import Telegraf from 'telegraf'

import { url } from './config.mjs'

const cols = 2
const { IMAGES_DIR } = process.env
const { Markup } = Telegraf

export const md5 = (string) => crypto
  .createHash('md5')
  .update(string)
  .digest('hex')

export const getPath = (file) => path.resolve(`${IMAGES_DIR}/${file}`)

export const getUserPath = ({ state, from }, file) => path
  .resolve(`${IMAGES_DIR}/${state && state.user && state.user.id || from.id}/${file}`)

export const getThemeSlug = (name) => name
  .split(' ')
  .map((word) => word.toLowerCase())
  .join('-')

export const getThemeName = (slug) => slug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

export const getImageFileName = (body, theme) => `${md5(body)}_${getThemeSlug(theme)}.jpg`

export const isExisted = (file) => fs.existsSync(file)

export const filenameFix = (file = '') => {
  const match = file.match(new RegExp(`(${IMAGES_DIR}/.+)$`))

  return match ? match[1] : file
}

export const getFileURL = (file) => `${url}${filenameFix(file)}`

export const getInlineFileURL = (file) => `${url}images/${filenameFix(file)}`

export const getImageWidth = (file) => sizeOf(getPath(file)).width

export const getImageHeight = (file) => sizeOf(getPath(file)).height

export const getPhotoData = (file, idx = null) => ({
  type: 'photo',
  photo_url: getInlineFileURL(file),
  thumb_url: getInlineFileURL(file),
  photo_width: getImageWidth(file),
  photo_height: getImageHeight(file),
  id: (file + (idx || '')).replace(/^\d+\/([0-9a-f]+)_\w+\.\w+$/g, '$1'),
})

export const isPrivateChat = ({ chat }) => chat.type === 'private'

// const escapeUser = (user = {}) => Object.keys(user).reduce((acc, key) => {
//   acc[key] = escape(user[key])
//   return acc
// }, {})

export const chatUser = (ctx) => ctx.state.user || ctx.from

export const themesKeyboard = (themes, cache = '') => themes
  .map((theme, idx) => {
    if ((idx + 1) % cols) {
      cache = `🎨 ${getThemeName(theme)}` // eslint-disable-line no-param-reassign
      return idx - 1 < themes.length ? false : cache
    }
    return [cache, `🎨 ${getThemeName(theme)}`]
  })
  .filter(Boolean)

export const replyWithPhoto = (ctx, image) => {
  ctx.replyWithChatAction('upload_photo')
  return ctx.replyWithPhoto(
    {
      source: image,
    },
    {
      ...Markup.inlineKeyboard([[{
        text: `Remove (only ${ctx.from.first_name} can)`,
        callback_data: `remove::${ctx.from.id}`,
      }]]).removeKeyboard().extra(),
      reply_to_message_id: ctx.message.message_id,
    }
  )
}

export const replyWithMediaGroup = async (ctx, images) => {
  ctx.replyWithChatAction('upload_photo')
  const messages = await ctx.replyWithMediaGroup(
    images.map((image) => ({
      type: 'photo',
      media: {
        url: getFileURL(image),
      },
    })),
    {
      reply_to_message_id: ctx.message.message_id,
    }
  )
  const ids = messages.map(({ message_id: messageId }) => messageId).join('|')

  ctx.replyWithMarkdown(
    '`====================================================`',
    Markup.inlineKeyboard([[{
      text: `Remove (only ${ctx.from.first_name} can)`,
      callback_data: `remove::${ctx.from.id}::${ids}`,
    }]]).removeKeyboard().extra()
  )
}

export const getWebShot = (html, imagePath, webshotOptions) => new Promise(
  (resolve, reject) => {
    webshot(html, imagePath, webshotOptions, (err) => err
      ? reject(err)
      : resolve(imagePath))
  }
)

export const replyWithDocument = (ctx, image) => {
  ctx.replyWithChatAction('upload_document')
  return ctx.replyWithDocument(
    {
      url: getFileURL(image),
    },
    {
      ...Markup.removeKeyboard().extra(),
      reply_to_message_id: ctx.message.message_id,
    }
  )
}

export const makeUserFolder = (user) => {
  const filepath = path.resolve(`images/${user.id}`)

  if (!isExisted(filepath)) {
    fs.mkdirSync(filepath)
  }
}

// eslint-disable-next-line no-console
export const onError = (err) => console.log(err)

export const clearFolder = ({ id }) => {
  const filePath = path.resolve(`${IMAGES_DIR}/${id}`)

  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw new Error(err)
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        fs.unlinkSync(`${filePath}/${file}`)
      })
    }
  })
}
