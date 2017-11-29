
exports.up = function (knex) {
  return knex.schema.createTable('chats', function (table) {
    table.integer('id').unique()
    table.string('name', 255).unique()
    table.boolean('active')
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chats')
}
