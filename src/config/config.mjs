import fs from 'fs'
import path from 'path'
import YAML from 'yaml'
import dotenv from 'dotenv'

export const ENV = dotenv.config().parsed

export const languages = YAML.parse(fs.readFileSync(path.resolve('src/config/languages.yml'), 'utf8'))

const { WEBHOOK_KEY, WEBHOOK_CERT, WEBHOOK_DOMAIN, WEBHOOK_PORT } = ENV

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
}

export const url = `https://${WEBHOOK_DOMAIN}:${WEBHOOK_PORT}/`
