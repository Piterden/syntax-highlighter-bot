import { inspect } from 'util'

export default (data) => console.log(inspect(data, {
  colors: true,
  showHidden: true,
  depth: Infinity,
}))
