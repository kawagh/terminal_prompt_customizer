import type { Shell } from "./ps1"

export interface SharedState {
  shell: Shell
  value: string
}

// Unicode 対応の base64 エンコード/デコード
function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ""
  bytes.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64(b64: string): string {
  const norm = b64.replace(/-/g, "+").replace(/_/g, "/")
  const bin = atob(norm)
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

// 状態を URL ハッシュ用の文字列へ
export function encodeState(state: SharedState): string {
  return toBase64(JSON.stringify(state))
}

export function decodeState(hash: string): SharedState | null {
  try {
    const clean = hash.replace(/^#/, "")
    if (!clean) return null
    const obj = JSON.parse(fromBase64(clean))
    if (typeof obj.value === "string" && (obj.shell === "bash" || obj.shell === "zsh")) {
      return { shell: obj.shell, value: obj.value }
    }
    return null
  } catch {
    return null
  }
}

// 現在の状態を含む共有 URL を生成
export function buildShareUrl(state: SharedState): string {
  if (typeof window === "undefined") return ""
  const { origin, pathname } = window.location
  return `${origin}${pathname}#${encodeState(state)}`
}

// .bashrc / .zshrc に貼れるスニペットを生成
export function buildSnippet(state: SharedState): string {
  if (state.shell === "bash") {
    return `# ~/.bashrc に追記\nexport PS1='${state.value.replace(/'/g, "'\\''")}'`
  }
  return `# ~/.zshrc に追記\nPROMPT='${state.value.replace(/'/g, "'\\''")}'`
}
