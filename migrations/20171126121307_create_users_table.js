
exports.up = function (knex) {
  return knex.schema.createTableIfNotExists('users', function (table) {
    table.bigInteger('id').unique()
    table.string('first_name', 255)
    table.string('last_name', 255)
    table.string('username', 255).unique()
    table.boolean('is_bot')
    table.string('language_code', 2)
    table.string('theme', 40)
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users')
}
