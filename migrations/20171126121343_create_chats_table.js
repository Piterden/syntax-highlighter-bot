
exports.up = function (knex) {
  return knex.schema.createTable('chats', function (table) {
    table.increments()
    table.string('name', 255)
    table.string('username', 255)
    table.boolean('active')
    table.timestamps()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chats')
}
