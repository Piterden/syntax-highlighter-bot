# Syntax Highlight Bot

The bot for creating an image with highlighted code from a message.

### Prerequisites

Bot written on the [Telegraf.js](https://github.com/telegraf/telegraf) bot framework, so all you need to run it is Node.js and npm.

### Installing

First of all clone this repository and install dependencies.

Run in bash:

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

* **Cristian Ospina** - *Initial work* - [CristianOspina](https://github.com/CristianOspina)
* **Denis Efremov** - *Rewrite to Node.js* - [Piterden](https://github.com/Piterden)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
