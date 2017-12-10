import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import highlight from 'highlight.js'

const _env = dotenv.config().parsed

export const themes = fs
  .readdirSync(path.resolve('node_modules/highlight.js/styles'))
  .filter((file) => file.endsWith('.css'))
  .map((file) => file.replace('.css', ''))

const getThemeCssFilePath = (theme) => path
  .resolve(`node_modules/highlight.js/styles/${theme}.css`)

const readCss = (theme) => fs.readFileSync(getThemeCssFilePath(theme))

const htmlhighlight = (body, lang) => lang
  ? highlight.highlight(lang, body).value
  : highlight.highlightAuto(body).value

export default {

  themeChanged: (user) => `Congratulations *${user.firstName}*, your default theme was changed to *${user.theme}*!`,


  themeChoose: 'Select the theme for all your codes, even those that you send in groups, they are sorted by popularity:',


  themeGroup: `To configure the theme of your code send me the command in private: @${_env.BOT_USER.replace(/_/g, '\\_')}`,


  welcomeGroup: () => `Hello!

If you send pieces of programming code with \`fixed-width code\` format in this group, I'll send a picture with syntax highlighting for easy reading.

You can also send me in private any code without the need of the \`fixed-width code\` format, try it: @${_env.BOT_USER.replace(/_/g, '\\_')}.

_If I am not working, try it privately, I don't like sending error messages in groups._`,


  welcomeUser: (user) => `Welcome, ${user.firstName} ${user.lastName}!

You can send to me chunks of a programming code, then you will receive it highlighted, as an image, for easy reading.

*Features:*

- *Groups:* Add me to a group, I'll help everyone to understand those pieces of code.

- *Languages:* I detect the language automatically, but if it does not work for some code, you can always specify the language. Do it now: /langs

- *Themes:* To each his own. Select your preferred theme, the one you select will be used when you generate codes here, in groups and in inline mode. Start now: /theme

- *Inline mode:* just type my username in any chat to check your recent codes or keep typing code to create a new one quickly (similar to the use of @gif etc.)`,


  getHtml: (theme, demoCode) => `<html lang="en">
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
  <pre style="max-width:1400px">
    <code class="hljs" id="code">${htmlhighlight(demoCode(theme))}</code>
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
export  syntaxHighlightBot;`,
}
