import fs from 'fs'
import path from 'path'
import highlight from 'highlight.js' // eslint-disable-line import/extensions

import { ENV } from './config'
import { getThemeSlug } from './methods'

const { BOT_USER } = ENV
const cols = 2
const maxWidth = 16

const getThemeCssFilePath = (theme) => path
  .resolve(`node_modules/highlight.js/styles/${getThemeSlug(theme)}.css`)

const readCss = (theme) => fs.readFileSync(getThemeCssFilePath(theme))

const htmlhighlight = (body, lang) => lang
  ? highlight.highlight(lang, body).value
  : highlight.highlightAuto(body).value

const makeCols = (lang, idx) => (idx + 1) % cols
  ? lang.replace(/,/g, '') + (new Array(maxWidth - lang.length)).fill(' ').join('')
  : `${lang}\n`

export const themes = fs
  .readdirSync(path.resolve('node_modules/highlight.js/styles'))
  .filter((file) => file.endsWith('.css'))
  .map((file) => file.replace('.css', ''))

export const langs = fs
  .readdirSync(path.resolve('node_modules/highlight.js/lib/languages'))
  .filter((file) => file.endsWith('.js'))
  .map((file) => file.replace('.js', ''))

export const messages = {
  langsList: () => `*Supported languages list:*\n
\`\`\`
${langs.map(makeCols).join('')}\`\`\`
*Usage:*\n
\\\`\\\`\\\`[language]
code
\\\`\\\`\\\``,

  themeChanged: ({ firstName, theme }) => `Congratulations *${firstName || 'stranger'}*, your default theme was changed to *${theme}*!`,

  themeChoose: (theme) => `Your selected theme is *${theme}*.\n
Select the new one theme for all your codes, even those that you send in groups:`,

  themeGroup: `To configure the theme of your code send me the command in private: @${BOT_USER.replace(/_/g, '\\_')}`,

  welcomeGroup: () => `Hello!\n
If you send pieces of programming code with \`fixed-width code\` format in this group, I'll send a picture with syntax highlighting for easy reading.\n
You can also send me in private any code without the need of the \`fixed-width code\` format, try it: @${BOT_USER.replace(/_/g, '\\_')}.\n
_If I am not working, try it privately, I don't like sending error messages in groups._`,

  welcomeUser: ({ firstName }) => `Welcome, ${firstName || 'stranger'}!\n
*This bot is WIP now!!!* The sources you could find [there](https://github.com/Piterden/syntax-highlighter-bot)\n
You can send to me chunks of a programming code formatted with three backticks, then you will receive an image with highlighted code.\n
*Features:*\n
- *Groups:* Add me to a group, I'll help everyone to understand those pieces of code.\n
- *Languages:* I detect the language automatically, but if it does not work for some code, you can always specify the language. Do it now: /langs\n
- *Themes:* To each his own. Select your preferred theme, the one you select will be used when you generate codes here, in groups and in inline mode. Start now: /theme\n
- *Inline mode:* just type my username in any chat to check your recent codes or keep typing code to create a new one quickly (similar to the use of @gif etc.)\n
_Any questions or bugs you can write to _@piterden_ (ru,en,code) or _@CristianOspina_ (es,en,idea)._`,

  getHtml: (code, theme, lang) => `<html lang="en">
<head>
<style>
  ::-webkit-scrollbar {
    display: none;
  }
  ${readCss(theme)}
  #code {
    white-space: pre-wrap;
    font-size: 12pt;
    font-family: monospace;
  }
</style>
</head>
<body style="display: inline-block;">
  <pre style="max-width: 1400px">
    <code class="hljs" id="code">${htmlhighlight(code, lang)}</code>
  </pre>
</body>
</html>`,

  demoCode: (theme) => `function syntaxHighlightBot(block, cls) {
  /**
   * Preview theme: ${theme}
   * http://t.me/SyntaxHighlightBot
   */
  try {
    if (cls.search(/\\bno\\-highlight\\b/) != -1)
      return process(block, true, 0x0F) + \` class="\\$\\{cls\\}"\`;
  } catch (e) {
    /* handle exception */
  }

  for (var i = 0 / 2; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined) {
      console.log('undefined'); // log
    }
  }
}
export syntaxHighlightBot;`,
}
