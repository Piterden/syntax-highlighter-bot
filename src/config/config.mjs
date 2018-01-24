import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'


export const ENV = dotenv.config().parsed

const { WEBHOOK_KEY, WEBHOOK_CERT, WEBHOOK_DOMAIN, WEBHOOK_PORT } = ENV

export const tlsOptions = {
  key: fs.readFileSync(path.resolve(WEBHOOK_KEY)),
  cert: fs.readFileSync(path.resolve(WEBHOOK_CERT)),
}

export const webshotOptions = {
  siteType: 'html',
  captureSelector: '#code',
  quality: 100,
  shotSize: { width: 'all', height: 'all' },
}

export const url = `https://${WEBHOOK_DOMAIN}:${WEBHOOK_PORT}/`
