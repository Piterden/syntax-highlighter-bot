
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments()
    table.string('name')
    table.string('theme')
    table.timestamps()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('chats')
}
