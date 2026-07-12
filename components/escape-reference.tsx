import type { Shell } from "@/lib/ps1"

interface Ref {
  code: string
  desc: string
}

const BASH_REF: Ref[] = [
  { code: "\\u", desc: "ユーザー名" },
  { code: "\\h", desc: "ホスト名 (最初の . まで)" },
  { code: "\\H", desc: "完全なホスト名" },
  { code: "\\w", desc: "作業ディレクトリ (フルパス)" },
  { code: "\\W", desc: "作業ディレクトリの basename" },
  { code: "\\$", desc: "一般ユーザーは $ / root は #" },
  { code: "\\t", desc: "時刻 (24時間 HH:MM:SS)" },
  { code: "\\A", desc: "時刻 (24時間 HH:MM)" },
  { code: "\\d", desc: "日付 (曜日 月 日)" },
  { code: "\\n", desc: "改行" },
  { code: "\\[ \\]", desc: "非表示文字の囲み (色指定に必須)" },
  { code: "\\e[..m", desc: "ANSI カラー / 装飾" },
]

const ZSH_REF: Ref[] = [
  { code: "%n", desc: "ユーザー名" },
  { code: "%m", desc: "ホスト名 (最初の . まで)" },
  { code: "%M", desc: "完全なホスト名" },
  { code: "%~", desc: "作業ディレクトリ (~ 短縮)" },
  { code: "%#", desc: "一般ユーザーは % / root は #" },
  { code: "%*", desc: "時刻 (HH:MM:SS)" },
  { code: "%T", desc: "時刻 (HH:MM)" },
  { code: "%F{色}..%f", desc: "前景色の指定と解除" },
  { code: "%K{色}..%k", desc: "背景色の指定と解除" },
  { code: "%B..%b", desc: "太字の開始と終了" },
  { code: "%U..%u", desc: "下線の開始と終了" },
  { code: "%%", desc: "リテラルの %" },
]

export function EscapeReference({ shell }: { shell: Shell }) {
  const refs = shell === "bash" ? BASH_REF : ZSH_REF
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {refs.map((r) => (
        <div key={r.code} className="flex items-baseline gap-3 border-b border-border/50 py-1">
          <code className="min-w-[76px] shrink-0 font-mono text-xs text-primary">{r.code}</code>
          <span className="text-xs text-muted-foreground">{r.desc}</span>
        </div>
      ))}
    </div>
  )
}
