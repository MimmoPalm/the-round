/**
 * Web Share API Level 2 (share with files) when the platform supports it,
 * falling back to triggering a plain download — no server involved either
 * way, so this works the same for the PWA and a plain browser tab.
 */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  opts?: { title?: string; text?: string },
): Promise<void> {
  const file = new File([blob], filename, { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean }

  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: opts?.title, text: opts?.text })
      return
    } catch (err) {
      // user dismissed the share sheet — not an error, just stop here
      if (err instanceof DOMException && err.name === 'AbortError') return
      // any other failure (unsupported target app etc.) — fall through to download
    }
  }

  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}
