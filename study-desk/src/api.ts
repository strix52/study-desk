import type { BootstrapPayload, CourseIndex, UserState } from './types'

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const fallback = await response.text()
    throw new Error(fallback || `Request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getBootstrap() {
  return requestJson<BootstrapPayload>('/api/bootstrap')
}

export async function refreshCourseIndex() {
  const payload = await requestJson<{ index: CourseIndex }>('/api/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  })

  return payload.index
}

export async function saveUserState(state: UserState) {
  await requestJson<{ ok: boolean }>('/api/state', {
    method: 'POST',
    body: JSON.stringify(state),
  })
}

export async function openLocalPath(relativePath: string, action: 'folder' | 'file' | 'editor') {
  return requestJson<{ ok: boolean; method: string; target: string }>('/api/open', {
    method: 'POST',
    body: JSON.stringify({ relativePath, action }),
  })
}

export function mediaUrl(relativePath: string) {
  return `/api/file?path=${encodeURIComponent(relativePath)}`
}
