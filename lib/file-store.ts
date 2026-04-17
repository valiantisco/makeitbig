// Module-level singleton — survives client-side navigation within the same tab
let _pendingFile: File | null = null

export function setPendingFile(file: File): void {
  _pendingFile = file
}

export function getPendingFile(): File | null {
  return _pendingFile
}

export function clearPendingFile(): void {
  _pendingFile = null
}
