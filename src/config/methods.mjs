import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sizeOf from 'image-size'
import Markup from 'telegraf/markup'

import { url, ENV } from './config'


const { IMAGES_DIR } = ENV
const cols = 2

export const md5 = (string) => crypto
  .createHash('md5')
  .update(string)
  .digest('hex')

export const getPath = (file) => path.resolve(`${IMAGES_DIR}/${file}`)

export const getTempPath = (ctx, file) => path.resolve(`${IMAGES_DIR}/${ctx.state && ctx.state.user && ctx.state.user.id}/${file}`)

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

export const filenameFix = (file) => {
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

export const chatUser = ({ from, state }) => state.user || from

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
      url: getFileURL(image),
    },
    Markup.removeKeyboard().extra()
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

  fs.readdir(filePath, (err, files) => files && files.length && files.forEach((file) => {
    fs.unlinkSync(`${filePath}/${file}`)
  }))
}
