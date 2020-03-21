exports.up = async (knex, Promise) => (await knex.schema.hasTable('chats'))
  ? null
  : knex.schema.createTable('chats', (table) => {
    table.bigInteger('id').unique()
    table.string('title', 255).unique()
    table.string('type', 40)
    table.boolean('active')
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('chats'))
  ? knex.schema.dropTable('chats')
  : null
