
exports.up = function (knex) {
  return knex.schema.createTable('uses', function (table) {
    table.increments()
    table.integer('user_id')
    table.integer('chat_id')
    table.boolean('active')
    table.timestamps()

    table.index(['user_id', 'chat_id'], 'use_index')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('uses')
}
