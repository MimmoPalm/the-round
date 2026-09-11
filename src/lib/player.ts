const STORAGE_KEY = 'the-round:player'

export function titleCase(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

export function getPlayer(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setPlayer(firstName: string, surname: string): string {
  const name = titleCase(`${firstName} ${surname}`)
  try {
    localStorage.setItem(STORAGE_KEY, name)
  } catch {
    // localStorage unavailable (private mode etc) — carry on in-memory
  }
  return name
}

export function clearPlayer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
