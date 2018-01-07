import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sizeOf from 'image-size'
import Markup from 'telegraf/markup'
import { url } from '../config/config'

export const md5 = (string) =>
  crypto.createHash('md5').update(string).digest('hex')

export const getPath = (file) =>
  path.resolve(`images/${file}`)

export const getTempPath = (ctx, file) =>
  path.resolve(`images/${ctx.state.user.id}/${file}`)

export const getThemeSlug = (name) => name
  .split(' ')
  .map((word) => word.toLowerCase())
  .join('-')

export const getThemeName = (slug) => slug
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ')

export const getImageFileName = (body, theme) =>
  `${md5(body)}_${getThemeSlug(theme)}.jpg`

export const isExisted = (file) => fs.existsSync(file)

export const filenameFix = (file) => {
  const match = file.match(/(images\/.+)$/)
  return match ? match[1] : file
}

export const getFileURL = (file) => `${url}${filenameFix(file)}`

export const getImageWidth = (file) => sizeOf(getPath(file)).width

export const getImageHeight = (file) => sizeOf(getPath(file)).height

export const getPhotoData = (file, idx = null) => ({
  'type': 'photo',
  'photo_url': getFileURL(file),
  'thumb_url': getFileURL(file),
  'photo_width': getImageWidth(file),
  'photo_height': getImageHeight(file),
  'id': file + (idx || ''),
})

export const isPrivateChat = (ctx) => ctx.chat.type === 'private'

export const chatUser = (ctx) => {
  if (!ctx.from) return false
  const user = { ...{}, ...ctx.from }
  delete user.is_bot
  return user
}

export const themesKeyboard = (themes, cache = '') => themes
  .map((theme, idx) => {
    if ((idx + 1) % 2) {
      cache = `🎨 ${getThemeName(theme)}`
      return idx - 1 < themes.length ? false : cache
    }
    return [cache, `🎨 ${getThemeName(theme)}`]
  })
  .filter(Boolean)

export const replyWithPhoto = (ctx, path) => {
  ctx.replyWithChatAction('upload_photo')
  return ctx.replyWithPhoto(
    { url: getFileURL(path) },
    Markup.removeKeyboard().extra()
  )
}

export const makeUserFolder = (user) => {
  const filepath = path.resolve(`images/${user.id}`)
  if (isExisted(filepath)) return
  fs.mkdirSync(filepath)
}

export const onError = (err) => console.log(err)
