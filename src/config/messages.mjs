import dotenv from 'dotenv'
const _env = dotenv.config().parsed

export default {
  leaveGroup: 'The highlighting bot was removed from group.',
  welcomeGroup: `Hello!

If you send pieces of programming code with \`fixed-width code\` format in this group, I'll send a picture with syntax highlighting for easy reading.

You can also send me in private any code without the need of the \`fixed-width code\` format, try it: @${_env.BOT_USER}.

_If I am not working, try it privately, I don't like sending error messages in groups._`,

}
