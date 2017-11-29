
exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.integer('id').unique()
    table.string('name', 255).unique()
    table.string('theme', 40)
    table.timestamps(['created_at', 'updated_at'])

    table.primary('id')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users')
}
