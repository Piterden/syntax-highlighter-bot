/* global document */

import { languages } from '../src/config/config.mjs'
import { messages, langs } from '../src/config/messages.mjs'
import { replyWithPhoto, replyWithMediaGroup } from '../src/config/methods.mjs'

const langsConfig = Object.keys(languages).reduce((result, key) => {
  const { ace_mode: lang, aliases = [], extensions = [] } = languages[key];

  [...aliases, ...extensions].forEach((name) => {
    result[name] = lang
  })

  return result
}, {})

export default (browser) => async (ctx) => {
  const images = await Promise.all(ctx.message.entities
    .filter(({ type }) => type === 'pre')
    .map(async (entity) => {
      let lang
      let full
      let source = ctx.message.text.slice(
        entity.offset,
        entity.offset + entity.length
      )
      const match = source.match(/^(\w+)\s+?\n/)
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
}
