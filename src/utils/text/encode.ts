import { FormatError } from '@/types/format'

export function urlEncode(input: string): string {
  try {
    return encodeURIComponent(input)
  } catch {
    throw new FormatError('not valid text')
  }
}

export function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input)
  } catch {
    throw new FormatError('not valid url encoding')
  }
}

const CHUNK = 0x8000

/** utf-8 safe base64 */
export function base64Encode(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

/** accepts standard and url-safe alphabets; throws on anything that isn't base64 or utf-8 */
export function base64Decode(input: string): string {
  if (input === '') return ''
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  try {
    const binary = atob(normalized)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new FormatError('not valid base64')
  }
}

function parseJson(input: string): unknown {
  try {
    return JSON.parse(input)
  } catch {
    throw new FormatError('not valid json')
  }
}

/** 2-space indented json */
export function jsonPretty(input: string): string {
  if (input === '') return ''
  return JSON.stringify(parseJson(input), null, 2)
}

export function jsonMinify(input: string): string {
  if (input === '') return ''
  return JSON.stringify(parseJson(input))
}
