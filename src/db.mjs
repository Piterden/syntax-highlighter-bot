import knex from 'knex'
import dotenv from 'dotenv'

import langs from './langs'
import themes from './themes'

const _env = dotenv.config().parsed

const welcomeGroup = `
**Hello! I'm the** @${_env.BOT_USER}

If you send me any piece of a programming code with \`fixed-width code\` format in this group, then I'll send you a picture with syntax highlighting for easy reading.

Also, you can send me any code without a need of the \`fixed-width code\` format, try it: @${_env.BOT_USER}.

_If I am not working, try it privately, I don't like sending error messages in groups._
`
