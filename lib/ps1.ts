// bash PS1 / zsh PROMPT 文字列を解釈し、スタイル付きトークン列に変換する

import { ANSI_16, NAMED_COLORS, xterm256ToHex } from "./ansi"

export type Shell = "bash" | "zsh"

export interface SampleContext {
  user: string
  host: string
  hostFull: string
  cwd: string // フルパス (~ 展開済み)
  home: string // ホームディレクトリ
  time24: string // HH:MM:SS
  time12: string // HH:MM:SS (12h 表記のベース)
  ampm: string // 02:30 PM
  short24: string // HH:MM
  date: string // Tue Jul 12
  dateShort: string // 26-07-12
  historyNum: string
  cmdNum: string
  jobs: string
  isRoot: boolean
}

export const DEFAULT_CONTEXT: SampleContext = {
  user: "dev",
  host: "macbook",
  hostFull: "macbook.local",
  cwd: "~/projects/awesome-app",
  home: "~",
  time24: "14:30:52",
  time12: "02:30:52",
  ampm: "02:30 PM",
  short24: "14:30",
  date: "Tue Jul 12",
  dateShort: "26-07-12",
  historyNum: "512",
  cmdNum: "42",
  jobs: "0",
  isRoot: false,
}

export interface Style {
  fg?: string
  bg?: string
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
  reverse?: boolean
}

export interface Token {
  text: string
  style: Style
}

interface RenderState {
  fg: string
  bg: string
  bold: boolean
  dim: boolean
  italic: boolean
  underline: boolean
  reverse: boolean
}

function emptyState(): RenderState {
  return { fg: "", bg: "", bold: false, dim: false, italic: false, underline: false, reverse: false }
}

function styleFromState(s: RenderState): Style {
  return {
    fg: s.fg || undefined,
    bg: s.bg || undefined,
    bold: s.bold || undefined,
    dim: s.dim || undefined,
    italic: s.italic || undefined,
    underline: s.underline || undefined,
    reverse: s.reverse || undefined,
  }
}

// SGR (\e[...m) パラメータを状態に適用
function applySGR(params: number[], state: RenderState) {
  for (let i = 0; i < params.length; i++) {
    const p = params[i]
    switch (true) {
      case p === 0:
        Object.assign(state, emptyState())
        break
      case p === 1:
        state.bold = true
        break
      case p === 2:
        state.dim = true
        break
      case p === 3:
        state.italic = true
        break
      case p === 4:
        state.underline = true
        break
      case p === 7:
        state.reverse = true
        break
      case p === 22:
        state.bold = false
        state.dim = false
        break
      case p === 23:
        state.italic = false
        break
      case p === 24:
        state.underline = false
        break
      case p === 27:
        state.reverse = false
        break
      case p >= 30 && p <= 37:
        state.fg = ANSI_16[p - 30]
        break
      case p === 38: {
        // 拡張前景色
        if (params[i + 1] === 5) {
          state.fg = xterm256ToHex(params[i + 2])
          i += 2
        } else if (params[i + 1] === 2) {
          state.fg = rgb(params[i + 2], params[i + 3], params[i + 4])
          i += 4
        }
        break
      }
      case p === 39:
        state.fg = ""
        break
      case p >= 40 && p <= 47:
        state.bg = ANSI_16[p - 40]
        break
      case p === 48: {
        if (params[i + 1] === 5) {
          state.bg = xterm256ToHex(params[i + 2])
          i += 2
        } else if (params[i + 1] === 2) {
          state.bg = rgb(params[i + 2], params[i + 3], params[i + 4])
          i += 4
        }
        break
      }
      case p === 49:
        state.bg = ""
        break
      case p >= 90 && p <= 97:
        state.fg = ANSI_16[p - 90 + 8]
        break
      case p >= 100 && p <= 107:
        state.bg = ANSI_16[p - 100 + 8]
        break
    }
  }
}

function rgb(r: number, g: number, b: number): string {
  const h = (v: number) => (v || 0).toString(16).padStart(2, "0")
  return `#${h(r)}${h(g)}${h(b)}`
}

function resolveColorName(name: string): string {
  const trimmed = name.trim()
  if (/^\d+$/.test(trimmed)) return xterm256ToHex(parseInt(trimmed, 10))
  const idx = NAMED_COLORS[trimmed.toLowerCase()]
  if (idx === undefined || idx < 0) return ""
  return ANSI_16[idx]
}

// メイン: プロンプト文字列 → トークン列
export function parsePrompt(input: string, shell: Shell, ctx: SampleContext = DEFAULT_CONTEXT): Token[] {
  const tokens: Token[] = []
  const state = emptyState()
  let buffer = ""

  const flush = () => {
    if (buffer.length > 0) {
      tokens.push({ text: buffer, style: styleFromState(state) })
      buffer = ""
    }
  }
  const emit = (text: string) => {
    buffer += text
  }

  let i = 0
  const len = input.length

  // \e[...m または ESC[...m を解釈。i は ESC の次を指す。戻り値は新しい i
  const readAnsi = (start: number): number => {
    // start は '[' を指す想定
    if (input[start] !== "[") {
      // OSC など (]0;...\a) はタイトル指定。無視して \a か BEL まで飛ばす
      if (input[start] === "]") {
        let j = start + 1
        while (j < len && input[j] !== "\x07" && !(input[j] === "\\" && input[j + 1] === "a")) j++
        return j + 1
      }
      return start
    }
    let j = start + 1
    let numStr = ""
    while (j < len && /[0-9;]/.test(input[j])) {
      numStr += input[j]
      j++
    }
    const final = input[j]
    if (final === "m") {
      flush()
      const params = numStr === "" ? [0] : numStr.split(";").map((n) => parseInt(n || "0", 10))
      applySGR(params, state)
    }
    return j + 1 // final 文字の次へ
  }

  if (shell === "bash") {
    while (i < len) {
      const c = input[i]
      if (c === "\\") {
        const n = input[i + 1]
        switch (n) {
          case "u":
            emit(ctx.user)
            i += 2
            break
          case "h":
            emit(ctx.host)
            i += 2
            break
          case "H":
            emit(ctx.hostFull)
            i += 2
            break
          case "w":
            emit(ctx.cwd)
            i += 2
            break
          case "W":
            emit(basename(ctx.cwd))
            i += 2
            break
          case "d":
            emit(ctx.date)
            i += 2
            break
          case "t":
            emit(ctx.time24)
            i += 2
            break
          case "T":
            emit(ctx.time12)
            i += 2
            break
          case "@":
            emit(ctx.ampm)
            i += 2
            break
          case "A":
            emit(ctx.short24)
            i += 2
            break
          case "s":
            emit("bash")
            i += 2
            break
          case "v":
            emit("5.2")
            i += 2
            break
          case "V":
            emit("5.2.15")
            i += 2
            break
          case "!":
            emit(ctx.historyNum)
            i += 2
            break
          case "#":
            emit(ctx.cmdNum)
            i += 2
            break
          case "j":
            emit(ctx.jobs)
            i += 2
            break
          case "l":
            emit("ttys000")
            i += 2
            break
          case "$":
            emit(ctx.isRoot ? "#" : "$")
            i += 2
            break
          case "n":
            emit("\n")
            i += 2
            break
          case "r":
            i += 2
            break
          case "a":
          case "\\a":
            i += 2
            break
          case "\\":
            emit("\\")
            i += 2
            break
          case "[":
          case "]":
            // 非表示文字マーカー。描画には影響しないので読み飛ばす
            i += 2
            break
          case "e":
            i += 2
            i = readAnsi(i)
            break
          default:
            // \033 のような 8 進数エスケープ (ESC = 033)
            if (n === "0" && input.slice(i + 1, i + 4) === "033") {
              i += 4
              i = readAnsi(i)
            } else if (/[0-7]/.test(n)) {
              // その他 8 進数はそのまま読み飛ばし
              let j = i + 1
              let oct = ""
              while (j < len && oct.length < 3 && /[0-7]/.test(input[j])) {
                oct += input[j]
                j++
              }
              i = j
            } else {
              emit(n ?? "")
              i += 2
            }
        }
      } else if (c === "\x1b") {
        // 生の ESC
        i += 1
        i = readAnsi(i)
      } else {
        emit(c)
        i += 1
      }
    }
  } else {
    // zsh
    while (i < len) {
      const c = input[i]
      if (c === "%") {
        const n = input[i + 1]
        switch (n) {
          case "n":
            emit(ctx.user)
            i += 2
            break
          case "m":
            emit(ctx.host)
            i += 2
            break
          case "M":
            emit(ctx.hostFull)
            i += 2
            break
          case "~":
            emit(ctx.cwd)
            i += 2
            break
          case "d":
          case "/":
            emit(ctx.cwd.replace(/^~/, ctx.home === "~" ? "/Users/" + ctx.user : ctx.home))
            i += 2
            break
          case "#":
            emit(ctx.isRoot ? "#" : "%")
            i += 2
            break
          case "*":
            emit(ctx.time24)
            i += 2
            break
          case "T":
            emit(ctx.short24)
            i += 2
            break
          case "t":
          case "@":
            emit(ctx.ampm)
            i += 2
            break
          case "D":
            emit(ctx.dateShort)
            i += 2
            break
          case "w":
            emit(ctx.date.slice(0, 3) + " " + ctx.dateShort.split("-")[2])
            i += 2
            break
          case "W":
            emit(ctx.dateShort.split("-").reverse().join("/"))
            i += 2
            break
          case "%":
            emit("%")
            i += 2
            break
          case "B":
            flush()
            state.bold = true
            i += 2
            break
          case "b":
            flush()
            state.bold = false
            i += 2
            break
          case "U":
            flush()
            state.underline = true
            i += 2
            break
          case "u":
            flush()
            state.underline = false
            i += 2
            break
          case "S":
            flush()
            state.reverse = true
            i += 2
            break
          case "s":
            flush()
            state.reverse = false
            i += 2
            break
          case "F": {
            // %F{color} or %F123
            flush()
            const res = readZshColorArg(input, i + 2)
            state.fg = resolveColorName(res.value)
            i = res.next
            break
          }
          case "f":
            flush()
            state.fg = ""
            i += 2
            break
          case "K": {
            flush()
            const res = readZshColorArg(input, i + 2)
            state.bg = resolveColorName(res.value)
            i = res.next
            break
          }
          case "k":
            flush()
            state.bg = ""
            i += 2
            break
          case "{":
            // 非表示文字グループ開始 %{ ... %}
            i += 2
            break
          case "}":
            i += 2
            break
          default:
            emit(n ?? "")
            i += 2
        }
      } else if (c === "\x1b") {
        i += 1
        i = readAnsi(i)
      } else if (c === "\\") {
        const n = input[i + 1]
        if (n === "e") {
          i += 2
          i = readAnsi(i)
        } else if (n === "n") {
          emit("\n")
          i += 2
        } else if (n === "0" && input.slice(i + 1, i + 4) === "033") {
          i += 4
          i = readAnsi(i)
        } else {
          emit(n ?? "")
          i += 2
        }
      } else {
        emit(c)
        i += 1
      }
    }
  }

  flush()
  return tokens
}

// zsh の %F{green} / %F2 両形式を読む
function readZshColorArg(input: string, start: number): { value: string; next: number } {
  if (input[start] === "{") {
    let j = start + 1
    let val = ""
    while (j < input.length && input[j] !== "}") {
      val += input[j]
      j++
    }
    return { value: val, next: j + 1 }
  }
  // 数値形式
  let j = start
  let val = ""
  while (j < input.length && /[0-9]/.test(input[j])) {
    val += input[j]
    j++
  }
  return { value: val, next: j }
}

function basename(path: string): string {
  const parts = path.replace(/\/+$/, "").split("/")
  const last = parts[parts.length - 1]
  return last === "" ? "/" : last
}
