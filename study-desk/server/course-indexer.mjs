import fs from 'node:fs/promises'
import path from 'node:path'
import {
  MEDIA_EXTENSIONS,
  STARTER_EXTENSIONS,
  cleanDisplayText,
  compareNatural,
  deriveWeekTitle,
  detectPromptFromSource,
  extractPartNumber,
  extractWeekNumber,
  formatPreview,
  inferLanguage,
  pathExists,
  readTextIfExists,
  stableId,
  summarizeMarkdown,
  toRelative,
} from './shared.mjs'

export async function buildCourseIndex({ courseRoot, dataRoot }) {
  const entries = await fs.readdir(courseRoot, { withFileTypes: true })
  const weekMap = new Map()

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    if (entry.name === 'study-desk' || entry.name === 'Harkirat Assignment') {
      continue
    }

    const weekNumber = extractWeekNumber(entry.name)
    if (weekNumber === null) {
      continue
    }

    const folderPath = path.join(courseRoot, entry.name)
    const partNumber = extractPartNumber(entry.name)
    const week = ensureWeek(weekMap, weekNumber, entry.name)
    week.lectureFolders.push(entry.name)

    const folderEntries = await fs.readdir(folderPath, { withFileTypes: true })
    const mediaFiles = folderEntries
      .filter((child) => child.isFile() && MEDIA_EXTENSIONS.has(path.extname(child.name).toLowerCase()))
      .sort((left, right) => compareNatural(left.name, right.name))

    mediaFiles.forEach((file, index) => {
      const extension = path.extname(file.name).toLowerCase()
      const itemType = extension === '.pdf' ? 'pdf' : extension === '.mp4' || extension === '.mkv' ? 'video' : 'image'
      const relativePath = toRelative(courseRoot, path.join(folderPath, file.name))
      const order = (partNumber ?? 0) * 100 + index + 1

      week.lessons.push({
        id: stableId('lesson', relativePath),
        kind: 'lesson',
        lessonType: itemType,
        weekNumber,
        weekLabel: `Week ${weekNumber}`,
        title: cleanDisplayText(file.name),
        relativePath,
        sourceFolder: entry.name,
        partLabel: partNumber ? `Part ${partNumber}` : undefined,
        extension,
        order,
      })
    })
  }

  const assignmentRoot = path.join(courseRoot, 'Harkirat Assignment')
  if (await pathExists(assignmentRoot)) {
    const assignmentWeeks = await fs.readdir(assignmentRoot, { withFileTypes: true })

    for (const entry of assignmentWeeks) {
      if (!entry.isDirectory()) {
        continue
      }

      const weekNumber = extractWeekNumber(entry.name)
      if (weekNumber === null) {
        continue
      }

      const week = ensureWeek(weekMap, weekNumber, entry.name)
      const folderPath = path.join(assignmentRoot, entry.name)
      const assignmentItems = await buildAssignmentItems({
        courseRoot,
        weekNumber,
        folderName: entry.name,
        folderPath,
      })
      week.assignments.push(...assignmentItems)
      week.assignmentFolders.push(entry.name)
    }
  }

  const weeks = [...weekMap.values()]
    .map((week) => {
      week.lessons.sort((left, right) => left.order - right.order || compareNatural(left.title, right.title))
      week.assignments.sort((left, right) => left.order - right.order || compareNatural(left.title, right.title))
      return week
    })
    .sort((left, right) => left.weekNumber - right.weekNumber)

  const stats = {
    weeks: weeks.length,
    lessons: 0,
    assignments: 0,
    videos: 0,
    pdfs: 0,
    images: 0,
  }

  for (const week of weeks) {
    stats.lessons += week.lessons.length
    stats.assignments += week.assignments.length

    for (const lesson of week.lessons) {
      if (lesson.lessonType === 'video') {
        stats.videos += 1
      } else if (lesson.lessonType === 'pdf') {
        stats.pdfs += 1
      } else {
        stats.images += 1
      }
    }
  }

  return {
    courseTitle: path.basename(courseRoot),
    courseRoot,
    dataRoot,
    generatedAt: new Date().toISOString(),
    stats,
    weeks,
  }
}

function ensureWeek(weekMap, weekNumber, sourceName) {
  if (!weekMap.has(weekNumber)) {
    weekMap.set(weekNumber, {
      id: `week-${weekNumber}`,
      weekNumber,
      weekLabel: `Week ${weekNumber}`,
      title: deriveWeekTitle(sourceName),
      lectureFolders: [],
      assignmentFolders: [],
      lessons: [],
      assignments: [],
    })
  }

  const existing = weekMap.get(weekNumber)
  if (!existing.title || existing.title === `Week ${weekNumber}`) {
    existing.title = deriveWeekTitle(sourceName)
  }
  return existing
}

async function buildAssignmentItems({ courseRoot, weekNumber, folderName, folderPath }) {
  const rootReadmePath = await findReadme(folderPath)
  const rootReadme = rootReadmePath ? await readTextIfExists(rootReadmePath) : undefined
  const entries = await fs.readdir(folderPath, { withFileTypes: true })
  const candidateDirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !isUtilityFolder(entry.name) &&
      !entry.name.startsWith('.') &&
      entry.name !== 'node_modules',
  )

  const assignmentItems = []

  if (candidateDirs.length === 0) {
    assignmentItems.push(
      await createAssignmentItem({
        courseRoot,
        weekNumber,
        sourcePath: folderPath,
        title: cleanDisplayText(folderName),
        orderOffset: 1,
        rootReadme,
      }),
    )
    return assignmentItems
  }

  const sortedDirs = [...candidateDirs].sort((left, right) => compareNatural(left.name, right.name))

  for (const [index, entry] of sortedDirs.entries()) {
    assignmentItems.push(
      await createAssignmentItem({
        courseRoot,
        weekNumber,
        sourcePath: path.join(folderPath, entry.name),
        title: cleanDisplayText(entry.name),
        orderOffset: index + 1,
        rootReadme,
      }),
    )
  }

  return assignmentItems
}

async function createAssignmentItem({ courseRoot, weekNumber, sourcePath, title, orderOffset, rootReadme }) {
  const files = []
  await walkFiles(courseRoot, sourcePath, files, 0, 3)

  const relativePath = toRelative(courseRoot, sourcePath)
  const localReadmePath = await findReadme(sourcePath)
  const readme = (localReadmePath ? await readTextIfExists(localReadmePath) : undefined) ?? rootReadme
  const starterCandidates = files.filter((file) => isStarterFile(file.relativePath))
  const testFiles = files
    .filter((file) => isTestFile(file.relativePath))
    .map((file) => file.relativePath)
    .slice(0, 10)
  const solutionFiles = files
    .filter((file) => isSolutionFile(file.relativePath))
    .map((file) => file.relativePath)
    .slice(0, 10)
  const previewFiles = []

  for (const file of starterCandidates.slice(0, 3)) {
    const content = await readTextIfExists(file.absolutePath)
    if (!content) {
      continue
    }

    previewFiles.push({
      path: file.relativePath,
      language: inferLanguage(file.relativePath),
      excerpt: formatPreview(content, 1200),
    })
  }

  const promptCandidate = previewFiles
    .map((preview) => detectPromptFromSource(preview.excerpt))
    .find(Boolean)

  const childEntries = await fs.readdir(sourcePath, { withFileTypes: true })
  const childFolders = childEntries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort(compareNatural)

  const difficulty = inferDifficulty(sourcePath)
  const summary = readme ? summarizeMarkdown(readme) : promptCandidate

  return {
    id: stableId('assignment', relativePath),
    kind: 'assignment',
    weekNumber,
    weekLabel: `Week ${weekNumber}`,
    title,
    relativePath,
    order: 1000 + orderOffset,
    difficulty,
    summary,
    readme,
    prompt: promptCandidate,
    previewFiles,
    starterFiles: starterCandidates.map((file) => file.relativePath).slice(0, 6),
    testFiles,
    solutionFiles,
    hasReadme: Boolean(readme),
    hasTests: testFiles.length > 0,
    hasSolution: solutionFiles.length > 0 || childFolders.some((child) => /solutions?/i.test(child)),
    childFolders,
  }
}

async function walkFiles(courseRoot, rootPath, collector, depth, maxDepth) {
  if (depth > maxDepth) {
    return
  }

  const entries = await fs.readdir(rootPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue
    }

    const absolutePath = path.join(rootPath, entry.name)

    if (entry.isDirectory()) {
      await walkFiles(courseRoot, absolutePath, collector, depth + 1, maxDepth)
      continue
    }

    collector.push({
      absolutePath,
      relativePath: toRelative(courseRoot, absolutePath),
    })
  }
}

async function findReadme(folderPath) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true })
  const readme = entries.find((entry) => entry.isFile() && /^readme(\.[a-z0-9]+)?$/i.test(entry.name))
  return readme ? path.join(folderPath, readme.name) : undefined
}

function isUtilityFolder(name) {
  return /^(tests?|solutions?)$/i.test(name)
}

function isTestFile(filePath) {
  return /(^|[/\\])(tests?)([/\\]|$)/i.test(filePath) || /\.(test|spec)\./i.test(filePath)
}

function isSolutionFile(filePath) {
  return /(^|[/\\])solutions?([/\\]|$)/i.test(filePath)
}

function isStarterFile(filePath) {
  const extension = path.extname(filePath).toLowerCase()
  if (!STARTER_EXTENSIONS.has(extension)) {
    return false
  }

  if (/package-lock\.json$/i.test(filePath)) {
    return false
  }

  return !isTestFile(filePath) && !isSolutionFile(filePath)
}

function inferDifficulty(sourcePath) {
  if (/easy/i.test(sourcePath)) {
    return 'easy'
  }

  if (/medium/i.test(sourcePath)) {
    return 'medium'
  }

  if (/hard/i.test(sourcePath)) {
    return 'hard'
  }

  return undefined
}
