
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('chunks', function (table) {
    table.bigInteger('id').unique()
    table.string('filename')
    table.integer('user_id').unsigned().notNullable()
    table.integer('chat_id').unsigned().notNullable()
    table.string('lang', 32)
    table.text('source', 'longtext')
    table.timestamp('created_at')

    table.primary('id')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chunks')
}
