# Syntax Highlighter Bot

The bot for creating an image with highlighted code from a message.

## Overview

This bot was written on top of the [Telegraf.js](https://github.com/telegraf/telegraf) bot framework, so all you need to have is the Node.js > v6.

## Usage

[Demo](https://t.me/cris_highlight_bot) (WIP version).

The bot listens for entities type of `pre` in any text message. It means, it will render all pieces of text, wrapped in triple backticks (multiline code). Also you could force the language, writing its name on the first line, right after backticks. Just like on the GitHub.

Look at the example of a code should be handled by the bot:

```markdown
```javascript
/**
 * Show themes list
 */
bot.command('theme', (ctx) => isPrivateChat(ctx)
  ? ctx.replyWithMarkdown(
    messages.themeChoose(ctx.state.user.theme),
    Markup.keyboard(themesKeyboard(themes)).oneTime().resize().extra()
  )
  : ctx.reply(messages.themeGroup)
)```
```

### Commands

- `/start` - Initial launch of the bot.
- `/theme` - Shows the list of included themes and allows you to select a theme which you like more.
- `/langs` - Shows the list of supported languages.

## Installing

First of all clone this repository and install dependencies. Run in the terminal:

```bash
$ git clone git@github.com:Piterden/syntax-highlighter-bot.git
$ cd syntax-highlighter-bot
$ npm i
```

Then you need to create and fill the new `.env` file:

```bash
$ cp .env.example .env
$ editor .env
```

## Built With

* [Telegraf.js](https://github.com/telegraf/telegraf) - The bot framework.
* [Objection.js](http://vincit.github.io/objection.js/) - ORM.
* [Express.js](https://expressjs.com/) - HTTP server.
* [Knex.js](http://knexjs.org/) - Query builder.

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Cristian Ospina** - *Bot's [initial version](https://github.com/Piterden/syntax-highlighter-bot/tree/old-double-bot)* - [CristianOspina](https://github.com/CristianOspina)
* **Denis Efremov** - *Rewrite to the Node.js* - [Piterden](https://github.com/Piterden)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
