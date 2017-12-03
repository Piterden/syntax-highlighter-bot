
exports.up = function (knex) {
  return knex.schema.createTable('chats', function (table) {
    table.bigInteger('id').unique()
    table.string('title', 255).unique()
    table.string('type', 40)
    table.boolean('active')
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chats')
}
