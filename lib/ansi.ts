// ANSI カラー処理ユーティリティ
// 標準16色 + xterm 256色 + truecolor を hex に変換する

// 標準色 (通常 0-7 / 明るい 8-15)。Tango 系に近い見やすいパレット。
export const ANSI_16: string[] = [
  "#2e3436", // 0 black
  "#cc0000", // 1 red
  "#4e9a06", // 2 green
  "#c4a000", // 3 yellow
  "#3465a4", // 4 blue
  "#75507b", // 5 magenta
  "#06989a", // 6 cyan
  "#d3d7cf", // 7 white
  "#555753", // 8 bright black (gray)
  "#ef2929", // 9 bright red
  "#8ae234", // 10 bright green
  "#fce94f", // 11 bright yellow
  "#729fcf", // 12 bright blue
  "#ad7fa8", // 13 bright magenta
  "#34e2e2", // 14 bright cyan
  "#eeeeec", // 15 bright white
]

// zsh の %F{name} などで使う名前 → 標準色番号
export const NAMED_COLORS: Record<string, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  default: -1,
}

// xterm 256色番号を hex に変換
export function xterm256ToHex(n: number): string {
  if (n < 0) return ""
  if (n < 16) return ANSI_16[n]
  if (n >= 16 && n <= 231) {
    const i = n - 16
    const r = Math.floor(i / 36)
    const g = Math.floor((i % 36) / 6)
    const b = i % 6
    const steps = [0, 95, 135, 175, 215, 255]
    return rgbToHex(steps[r], steps[g], steps[b])
  }
  // 232-255: グレースケール
  const level = 8 + (n - 232) * 10
  return rgbToHex(level, level, level)
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (v: number) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}`
}
