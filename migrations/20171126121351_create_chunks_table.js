
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('chunks', function (table) {
    table.string('filename').primary()
    table.integer('user_id').unsigned().notNullable()
    table.integer('chat_id').unsigned().notNullable()
    table.string('lang', 32)
    table.text('source', 'longtext')
    table.timestamp('created_at')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chunks')
}
