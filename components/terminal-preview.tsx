import { useMemo } from "react"
import type { CSSProperties } from "react"
import { parsePrompt, type Shell, type Token, DEFAULT_CONTEXT } from "@/lib/ps1"

// ターミナルの既定色
const TERM_FG = "#e6e6e6"
const TERM_BG = "#0c0d10"

interface TerminalPreviewProps {
  value: string
  shell: Shell
  showOutput: boolean
}

// ダミーで表示するコマンド実行例
const DEMO_LINES: { cmd: string; out: string[] }[] = [
  { cmd: "ls", out: ["README.md  package.json  src/  node_modules/"] },
  { cmd: "git status", out: ["On branch main", "nothing to commit, working tree clean"] },
  { cmd: "npm run build", out: ["✓ Compiled successfully in 2.3s"] },
]

function tokenStyle(token: Token): CSSProperties {
  const s = token.style
  let fg = s.fg || TERM_FG
  let bg = s.bg || undefined
  if (s.reverse) {
    const realFg = fg
    fg = bg || TERM_BG
    bg = realFg
  }
  return {
    color: fg,
    backgroundColor: bg,
    fontWeight: s.bold ? 700 : 400,
    fontStyle: s.italic ? "italic" : undefined,
    textDecoration: s.underline ? "underline" : undefined,
    opacity: s.dim ? 0.6 : undefined,
  }
}

// トークン列を、改行を跨いだ複数行の span としてレンダリング
function renderTokens(tokens: Token[], keyPrefix: string) {
  const nodes: React.ReactNode[] = []
  let lineKey = 0
  tokens.forEach((token, ti) => {
    const parts = token.text.split("\n")
    parts.forEach((part, pi) => {
      if (pi > 0) {
        nodes.push(<br key={`${keyPrefix}-br-${ti}-${lineKey++}`} />)
      }
      if (part.length > 0) {
        nodes.push(
          <span key={`${keyPrefix}-t-${ti}-${pi}`} style={tokenStyle(token)}>
            {part}
          </span>,
        )
      }
    })
  })
  return nodes
}

export function TerminalPreview({ value, shell, showOutput }: TerminalPreviewProps) {
  const tokens = useMemo(() => parsePrompt(value, shell, DEFAULT_CONTEXT), [value, shell])

  return (
    <div className="overflow-hidden rounded-xl border border-border shadow-2xl">
      {/* タイトルバー */}
      <div className="flex items-center gap-2 border-b border-border bg-[#1b1d22] px-4 py-2.5">
        <span className="size-3 rounded-full bg-[#ff5f56]" />
        <span className="size-3 rounded-full bg-[#ffbd2e]" />
        <span className="size-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 font-mono text-xs text-[#8b8d94]">
          {DEFAULT_CONTEXT.user}@{DEFAULT_CONTEXT.host}: {shell}
        </span>
      </div>

      {/* 画面 */}
      <div
        className="min-h-[220px] overflow-x-auto p-4 font-mono text-sm leading-relaxed"
        style={{ backgroundColor: TERM_BG, color: TERM_FG }}
      >
        {showOutput ? (
          <div className="whitespace-pre-wrap break-words">
            {DEMO_LINES.map((line, idx) => (
              <div key={idx}>
                <span>{renderTokens(tokens, `p-${idx}`)}</span>
                <span>{line.cmd}</span>
                {line.out.map((o, oi) => (
                  <div key={oi} className="text-[#b8b9bf]">
                    {o}
                  </div>
                ))}
              </div>
            ))}
            {/* 最後の入力待ちプロンプト */}
            <div>
              <span>{renderTokens(tokens, "p-final")}</span>
              <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-[#e6e6e6]" />
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words">
            <span>{renderTokens(tokens, "p-single")}</span>
            <span className="inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] animate-pulse bg-[#e6e6e6]" />
          </div>
        )}
      </div>
    </div>
  )
}
