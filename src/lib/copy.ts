// Dry, British, affectionate progress copy — never memes.
export function progressLine(visited: number, total: number): string {
  const remaining = total - visited
  if (visited === 0) {
    return `${total} pubs, none of them ticked. Islington isn't going to drink itself.`
  }
  if (remaining === 0) {
    return `All ${total} down. There is, technically, nothing left to do here.`
  }
  return `${visited} down, ${remaining} to go. Islington isn't going to drink itself.`
}
