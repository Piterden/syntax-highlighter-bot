
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments()
    table.string('telegram_id', 40)
    table.string('name', 255)
    table.string('theme', 40)
    table.timestamps()
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users')
}
