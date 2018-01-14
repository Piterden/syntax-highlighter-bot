import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'


export const ENV = dotenv.config().parsed

export const tlsOptions = {
  key: fs.readFileSync(path.resolve(ENV.WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(ENV.WEBHOOK_CERT)),
}

export const webshotOptions = {
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
}

export const url = `https://${ENV.WEBHOOK_DOMAIN}:${ENV.WEBHOOK_PORT}/`
