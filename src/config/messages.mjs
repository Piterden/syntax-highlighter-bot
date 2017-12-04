import dotenv from 'dotenv'
const _env = dotenv.config().parsed

export default {
  themeChoose: 'Select the theme for all your codes, even those that you send in groups, they are sorted by popularity:',

  themeGroup: `To configure the theme of your code send me the command in private: @${_env.BOT_USER}`,

  welcomeGroup: `Hello!

If you send pieces of programming code with \`fixed-width code\` format in this group, I'll send a picture with syntax highlighting for easy reading.

You can also send me in private any code without the need of the \`fixed-width code\` format, try it: @${_env.BOT_USER}.

_If I am not working, try it privately, I don't like sending error messages in groups._`,

  welcomeUser: (user) => `Welcome, ${user.firstName} ${user.lastName}!

You could send me some chunks of a programming code and then, you would receive it highlighted, as an image for easy reading.

*Features:*
- *Groups:* Add me to a group, I'll help everyone to understand those pieces of code.
- *Languages:* I detect the language automatically, but if it does not work for some code, you can always specify the language. Do it now: /langs
- *Themes:* To each his own. Select your preferred theme, the one you select will be used when you generate codes here, in groups and in inline mode. Start now: /theme
- *Inline mode:* just type my username in any chat to check your recent codes or keep typing code to create a new one quickly (similar to the use of @gif etc.)`,
}
