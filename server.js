import express from 'express'
import { existsSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const app = express()
const distPath = resolve(__dirname, 'dist')
const indexPath = join(distPath, 'index.html')
const port = Number(process.env.PORT ?? 4173)
const host = process.env.HOST ?? '0.0.0.0'

if (!existsSync(indexPath)) {
  console.error('Missing dist/index.html. Run `npm run build` before `npm run serve`.')
  process.exit(1)
}

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use(
  express.static(distPath, {
    etag: true,
    immutable: true,
    index: false,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store')
      }
    },
  }),
)

app.use((req, res, next) => {
  if (req.method !== 'GET' || !req.accepts('html')) {
    next()
    return
  }

  res.sendFile(indexPath)
})

app.listen(port, host, () => {
  console.log(`Express server ready on http://localhost:${port}`)

  for (const address of getLanAddresses()) {
    console.log(`Phone URL: http://${address}:${port}`)
  }
})

function getLanAddresses() {
  return Object.values(networkInterfaces())
    .flat()
    .filter(Boolean)
    .filter((net) => net.family === 'IPv4' && !net.internal)
    .map((net) => net.address)
}
