
exports.up = function (knex) {
  return knex.schema.createTable('uses', function (table) {
    table.increments()
    table.string('hash', 32).notNullable()
    table.integer('user_id').unsigned().notNullable()
    table.integer('chat_id').unsigned().notNullable()
    table.string('lang', 40).nullable()
    table.text('code', 'longtext')
    table.binary('image')
    table.timestamp('created_at')

    table.index('hash')
    table.index(['user_id', 'chat_id'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('uses')
}
