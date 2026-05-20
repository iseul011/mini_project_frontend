// src/app/cleaning/api.ts
const BASE = '/api/v1/cleaning'

/** BFF `maxDuration` 120초 · upstream `UPSTREAM_MS` 110초 (슬롯 1회당) */
export const CLEANING_AI_TIMEOUT_MS = 120_000

async function postCleaningForm(path: string, form: FormData): Promise<Response> {
  try {
    return await fetch(`${BASE}/${path}`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(CLEANING_AI_TIMEOUT_MS),
    })
  } catch (e) {
    if (e instanceof Error && e.name === 'TimeoutError') {
      throw new Error('Gemini AI 응답 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.')
    }
    throw e
  }
}

export interface AiMonster {
  id: string
  name: string
  grade: string
  location: string
  icon: string
  ability: string
  ability_desc: string
  exp: number
  gold: number
}

export interface ScanResult {
  monsters: AiMonster[]
  pollution_level: number
  summary: string
  model_id?: string
  model_label?: string
}

export interface VerifyResult {
  cleanliness: number
  comment: string
  model_id?: string
  model_label?: string
}

export type BaselineEvalResult = {
  quality_score: number
  acceptable: boolean
  comment: string
  model_id?: string
  model_label?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatResult {
  reply: string
  model_id?: string
  model_label?: string
}

export interface MemoryPayload {
  room_id: string
  room_name: string
  cleanliness: number
  monsters_cleared: string[]
  duration_seconds: number
  exp_gained: number
  gold_gained: number
}

export interface CleaningAiInfo {
  vision_label: string
  chat_label: string
  vision_model: string
  chat_model: string
}

export async function fetchCleaningAiInfo(): Promise<CleaningAiInfo> {
  const res = await fetch(`${BASE}/ai-info`, { credentials: 'include' })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function scanRoom(file: File, roomId: string, roomName: string): Promise<ScanResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('room_id', roomId)
  form.append('room_name', roomName)
  const res = await postCleaningForm('scan', form)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function verifyRoom(file: File, roomId: string, roomName: string): Promise<VerifyResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('room_id', roomId)
  form.append('room_name', roomName)
  const res = await postCleaningForm('verify', form)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function evaluateBaselineSlot(file: File, slotLabel: string): Promise<BaselineEvalResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('slot_label', slotLabel)
  const res = await postCleaningForm('baseline-eval', form)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function compareWithBaseline(
  baselineFile: File,
  afterFile: File,
  slotLabel: string,
): Promise<VerifyResult> {
  const form = new FormData()
  form.append('baseline_file', baselineFile)
  form.append('after_file', afterFile)
  form.append('slot_label', slotLabel)
  const res = await postCleaningForm('compare-baseline', form)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function coachChat(
  roomId: string,
  roomName: string,
  pollutionLevel: number,
  monstersRemaining: string[],
  history: ChatMessage[],
  userMessage: string,
): Promise<ChatResult> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      room_id: roomId,
      room_name: roomName,
      pollution_level: pollutionLevel,
      monsters_remaining: monstersRemaining,
      history,
      user_message: userMessage,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function saveCleaningMemory(payload: MemoryPayload): Promise<void> {
  const res = await fetch(`${BASE}/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
}
