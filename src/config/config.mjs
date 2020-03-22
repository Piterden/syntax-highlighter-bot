import fs from 'graceful-fs'
import path from 'path'
import YAML from 'yaml'

const { WEBHOOK_DOMAIN, WEBHOOK_PORT, WEBHOOK_KEY, WEBHOOK_CERT } = process.env

export const languages = YAML.parse(fs.readFileSync(
  path.resolve('src/config/languages.yml'),
  'utf8',
))

export const tlsOptions = {
  key: fs.readFileSync(path.resolve(WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(WEBHOOK_CERT)),
}

export const webshotOptions = {
  streamType: 'png',
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
  // windowSize: { width: 1920, height: 1080 },
  // phantomPath: path.resolve('node_modules/phantomjs/lib/phantom/bin/phantomjs'),
  phantomConfig: { 'ssl-protocol': 'any', 'ignore-ssl-errors': 'true' },
  takeShotOnCallback: true,
}

export const url = `https://${WEBHOOK_DOMAIN}:${WEBHOOK_PORT}/`
