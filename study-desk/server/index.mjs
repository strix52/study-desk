import express from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { buildCourseIndex } from './course-indexer.mjs'
import { ensureDir, isInsideRoot, pathExists, readTextIfExists, slugify } from './shared.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(__dirname, '..')
const courseRoot = path.resolve(appRoot, '..')
const courseName = path.basename(courseRoot)
const dataRoot = path.resolve(appRoot, '.study-desk-data', slugify(courseName))
const cachePath = path.join(dataRoot, 'course-index.json')
const statePath = path.join(dataRoot, 'user-state.json')
const distPath = path.join(appRoot, 'dist')
const port = Number.parseInt(process.env.PORT ?? '4307', 10)

await ensureDir(dataRoot)

const app = express()
app.use(express.json({ limit: '2mb' }))

app.get('/api/bootstrap', async (_request, response) => {
  try {
    const index = await readOrBuildIndex()
    const state = await readUserState()
    response.json({ index, state })
  } catch (error) {
    response.status(500).json({ error: serializeError(error) })
  }
})

app.post('/api/refresh', async (_request, response) => {
  try {
    const index = await buildAndCacheIndex()
    response.json({ index })
  } catch (error) {
    response.status(500).json({ error: serializeError(error) })
  }
})

app.post('/api/state', async (request, response) => {
  try {
    const payload = {
      ...request.body,
      updatedAt: new Date().toISOString(),
    }
    await fs.writeFile(statePath, JSON.stringify(payload, null, 2), 'utf8')
    response.json({ ok: true })
  } catch (error) {
    response.status(500).json({ error: serializeError(error) })
  }
})

app.get('/api/file', async (request, response) => {
  try {
    const relativePath = String(request.query.path ?? '')
    const absolutePath = resolveCoursePath(relativePath)
    const stats = await fs.stat(absolutePath)

    if (!stats.isFile()) {
      response.status(404).json({ error: 'File not found' })
      return
    }

    response.sendFile(absolutePath)
  } catch (error) {
    response.status(404).json({ error: serializeError(error) })
  }
})

app.post('/api/open', async (request, response) => {
  try {
    const { relativePath, action } = request.body ?? {}
    const absolutePath = resolveCoursePath(String(relativePath ?? ''))
    const result = await openPath(absolutePath, action)
    response.json({ ok: true, ...result })
  } catch (error) {
    response.status(400).json({ error: serializeError(error) })
  }
})

if (await pathExists(distPath)) {
  app.use(express.static(distPath))
  app.get(/^(?!\/api).*/, async (_request, response) => {
    response.type('html').send(await readTextIfExists(path.join(distPath, 'index.html')))
  })
}

app.listen(port, () => {
  console.log(`Study desk server running on http://localhost:${port}`)
  console.log(`Course root: ${courseRoot}`)
  console.log(`Data root: ${dataRoot}`)
})

async function readOrBuildIndex() {
  if (await pathExists(cachePath)) {
    try {
      const cached = await readTextIfExists(cachePath)
      if (cached) return JSON.parse(cached)
    } catch {
      // Corrupt cache — rebuild
    }
  }

  return buildAndCacheIndex()
}

async function buildAndCacheIndex() {
  const index = await buildCourseIndex({ courseRoot, dataRoot })
  await fs.writeFile(cachePath, JSON.stringify(index, null, 2), 'utf8')
  return index
}

async function readUserState() {
  if (await pathExists(statePath)) {
    try {
      const stored = await readTextIfExists(statePath)
      if (stored) return JSON.parse(stored)
    } catch {
      // Corrupt state — use defaults
    }
  }

  const initialState = {
    itemStates: {},
    notes: {},
    recent: [],
    updatedAt: new Date().toISOString(),
  }
  await fs.writeFile(statePath, JSON.stringify(initialState, null, 2), 'utf8')
  return initialState
}

function resolveCoursePath(relativePath) {
  if (!relativePath) {
    throw new Error('Missing path')
  }

  const normalized = relativePath.replaceAll('/', path.sep)
  const absolutePath = path.resolve(courseRoot, normalized)

  if (!isInsideRoot(courseRoot, absolutePath)) {
    throw new Error('Path escapes the course root')
  }

  return absolutePath
}

async function openPath(absolutePath, action) {
  const stats = await fs.stat(absolutePath)
  const openAction = action === 'file' || action === 'editor' ? action : 'folder'

  if (openAction === 'folder') {
    const target = stats.isDirectory() ? absolutePath : path.dirname(absolutePath)
    await launch('explorer.exe', [target])
    return { method: 'explorer', target }
  }

  if (openAction === 'file') {
    await launch('explorer.exe', [absolutePath])
    return { method: 'explorer', target: absolutePath }
  }

  for (const candidate of [
    ['code', ['-g', absolutePath]],
    ['cursor', ['-g', absolutePath]],
    ['code-insiders', ['-g', absolutePath]],
  ]) {
    try {
      await launch(candidate[0], candidate[1])
      return { method: candidate[0], target: absolutePath }
    } catch {
      continue
    }
  }

  const fallback = stats.isDirectory() ? absolutePath : path.dirname(absolutePath)
  await launch('explorer.exe', [fallback])
  return { method: 'explorer-fallback', target: fallback }
}

function launch(command, args) {
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(command, args, {
        detached: true,
        stdio: 'ignore',
        shell: false,
      })
      child.once('error', reject)
      child.unref()
      setTimeout(resolve, 200)
    } catch (err) {
      reject(err)
    }
  })
}

function serializeError(error) {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}
