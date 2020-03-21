exports.up = async (knex, Promise) => (await knex.schema.hasTable('users'))
  ? null
  : knex.schema.createTable('users', (table) => {
    table.integer('id').unsigned()
    table.boolean('is_bot')
    table.string('first_name')
    table.string('last_name')
    table.string('username')
    table.string('language_code')
    table.string('theme', 40)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at')

    table.primary('id')
  })

exports.down = async (knex, Promise) => (await knex.schema.hasTable('users'))
  ? knex.schema.dropTable('users')
  : null
