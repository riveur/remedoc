import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const paths = {
  commands: path.join(dirname, '../commands'),
  events: path.resolve(dirname, '../events'),
}
