/**
 * Sleep pause.
 *
 * @param {Number} time The time in milliseconds.
 * @return {Promise<void>}
 */
export default (time) => new Promise((resolve) => {
  setTimeout(resolve, time)
})
