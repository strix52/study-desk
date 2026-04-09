import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

export const MEDIA_EXTENSIONS = new Set([
  '.mp4',
  '.mkv',
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
])

export const STARTER_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.html',
  '.css',
  '.md',
  '.sql',
  '.prisma',
  '.yml',
  '.yaml',
  '.txt',
  '.sh',
])

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function stableId(prefix, value) {
  const digest = crypto.createHash('sha1').update(value).digest('hex').slice(0, 12)
  return `${prefix}-${digest}`
}

export function extractWeekNumber(value) {
  const match = value.match(/week\s*[-_\s]*?(\d+)/i)
  return match ? Number.parseInt(match[1], 10) : null
}

export function extractPartNumber(value) {
  const match = value.match(/part\s*[-_\s]*?(\d+)/i)
  return match ? Number.parseInt(match[1], 10) : null
}

export function normalizeSpaces(value) {
  return value.replace(/\s+/g, ' ').trim()
}

export function stripExtension(value) {
  return value.replace(/\.[^.]+$/, '')
}

export function cleanDisplayText(value) {
  return normalizeSpaces(
    stripExtension(value)
      .replace(/[_]+/g, ' ')
      .replace(/\s+-\s+/g, ' - ')
      .replace(/[()[\]]/g, ' ')
      .replace(/\s+,/g, ','),
  )
}

export function deriveWeekTitle(folderName) {
  const cleaned = folderName
    .replace(/week\s*[-_\s]*\d+/gi, '')
    .replace(/part\s*[-_\s]*\d+/gi, '')
    .replace(/[()]/g, ' ')
    .replace(/[-_]{2,}/g, ' ')
  return normalizeSpaces(cleaned).replace(/^[,-\s]+|[,-\s]+$/g, '') || folderName
}

export function toRelative(root, absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join('/')
}

export function compareNatural(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
}

export async function ensureDir(targetPath) {
  await fs.mkdir(targetPath, { recursive: true })
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath)
    return true
  } catch {
    return false
  }
}

export async function readTextIfExists(targetPath) {
  try {
    return await fs.readFile(targetPath, 'utf8')
  } catch {
    return undefined
  }
}

export function isInsideRoot(rootPath, targetPath) {
  const relative = path.relative(rootPath, targetPath)
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

export function summarizeMarkdown(markdown) {
  const condensed = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, '$1')
    .replace(/[`>*_~-]/g, ' ')
    .replace(/\n+/g, ' ')
  const normalized = normalizeSpaces(condensed)
  return normalized.length > 220 ? `${normalized.slice(0, 217)}...` : normalized
}

export function detectPromptFromSource(sourceText) {
  const trimmed = sourceText.replace(/^\uFEFF/, '').trimStart()
  const blockMatch = trimmed.match(/^(\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)\s*/)
  if (blockMatch) {
    return normalizeComment(blockMatch[1])
  }

  const lines = trimmed.split(/\r?\n/)
  const leading = []

  for (const line of lines.slice(0, 24)) {
    const stripped = line.trim()
    if (!stripped && leading.length > 0) {
      break
    }

    if (/^(\/\/|#|'|--)/.test(stripped)) {
      leading.push(stripped.replace(/^(\/\/|#|'|--)\s?/, ''))
      continue
    }

    break
  }

  if (leading.length === 0) {
    return undefined
  }

  return normalizeSpaces(leading.join(' '))
}

export function normalizeComment(comment) {
  return normalizeSpaces(
    comment
      .replace(/^\/\*+/, '')
      .replace(/\*+\/$/, '')
      .replace(/^<!--/, '')
      .replace(/-->$/, '')
      .replace(/^\s*\*\s?/gm, ' ')
      .replace(/\r?\n/g, ' '),
  )
}

export function formatPreview(text, limit = 1000) {
  const trimmed = text.replace(/\t/g, '  ').trim()
  return trimmed.length > limit ? `${trimmed.slice(0, limit)}\n...` : trimmed
}

export function inferLanguage(fileName) {
  const extension = path.extname(fileName).toLowerCase()
  const languageMap = {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.js': 'js',
    '.jsx': 'jsx',
    '.json': 'json',
    '.html': 'html',
    '.css': 'css',
    '.md': 'md',
    '.sql': 'sql',
    '.prisma': 'prisma',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.sh': 'bash',
  }

  return languageMap[extension] ?? 'text'
}
