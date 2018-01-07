import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

export const _env = dotenv.config().parsed

export const tlsOptions = {
  key: fs.readFileSync(path.resolve(_env.WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(_env.WEBHOOK_CERT)),
}

export const webshotOptions = {
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
}

export const url = `https://${_env.WEBHOOK_DOMAIN}:${_env.WEBHOOK_PORT}/`
