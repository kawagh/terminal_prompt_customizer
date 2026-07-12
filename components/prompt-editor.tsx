"use client"

import { useRef } from "react"
import type { Shell } from "@/lib/ps1"

interface InsertItem {
  label: string
  insert: string
  hint: string
}

const BASH_TOKENS: InsertItem[] = [
  { label: "\\u", insert: "\\u", hint: "ユーザー名" },
  { label: "\\h", insert: "\\h", hint: "ホスト名" },
  { label: "\\w", insert: "\\w", hint: "作業ディレクトリ" },
  { label: "\\W", insert: "\\W", hint: "ディレクトリ名" },
  { label: "\\$", insert: "\\$", hint: "$ / #" },
  { label: "\\t", insert: "\\t", hint: "時刻" },
  { label: "改行", insert: "\\n", hint: "改行" },
]

const ZSH_TOKENS: InsertItem[] = [
  { label: "%n", insert: "%n", hint: "ユーザー名" },
  { label: "%m", insert: "%m", hint: "ホスト名" },
  { label: "%~", insert: "%~", hint: "作業ディレクトリ" },
  { label: "%#", insert: "%#", hint: "% / #" },
  { label: "%*", insert: "%*", hint: "時刻" },
  { label: "改行", insert: "\n", hint: "改行" },
]

interface ColorItem {
  label: string
  hex: string
  bash: string
  zsh: string
}

const COLORS: ColorItem[] = [
  { label: "赤", hex: "#cc0000", bash: "\\[\\e[31m\\]", zsh: "%F{red}" },
  { label: "緑", hex: "#4e9a06", bash: "\\[\\e[32m\\]", zsh: "%F{green}" },
  { label: "黄", hex: "#c4a000", bash: "\\[\\e[33m\\]", zsh: "%F{yellow}" },
  { label: "青", hex: "#3465a4", bash: "\\[\\e[34m\\]", zsh: "%F{blue}" },
  { label: "紫", hex: "#75507b", bash: "\\[\\e[35m\\]", zsh: "%F{magenta}" },
  { label: "水", hex: "#06989a", bash: "\\[\\e[36m\\]", zsh: "%F{cyan}" },
]

interface PromptEditorProps {
  value: string
  shell: Shell
  onChange: (value: string) => void
}

export function PromptEditor({ value, shell, onChange }: PromptEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) {
      onChange(value + text)
      return
    }
    const start = ta.selectionStart ?? value.length
    const end = ta.selectionEnd ?? value.length
    const next = value.slice(0, start) + text + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + text.length
      ta.setSelectionRange(pos, pos)
    })
  }

  const insertReset = () => insertAtCursor(shell === "bash" ? "\\[\\e[0m\\]" : "%f")
  const tokens = shell === "bash" ? BASH_TOKENS : ZSH_TOKENS

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor="ps1-input" className="text-sm font-medium text-foreground">
        {shell === "bash" ? "PS1 の値" : "PROMPT の値"}
      </label>
      <textarea
        id="ps1-input"
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        rows={3}
        className="w-full resize-y rounded-lg border border-input bg-input/30 px-3 py-2.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        placeholder={shell === "bash" ? "\\u@\\h:\\w\\$ " : "%n@%m:%~%# "}
      />

      {/* 変数の挿入 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">変数を挿入</span>
        <div className="flex flex-wrap gap-1.5">
          {tokens.map((t) => (
            <button
              key={t.label}
              type="button"
              title={t.hint}
              onClick={() => insertAtCursor(t.insert)}
              className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground transition-colors hover:bg-muted"
            >
              {t.label}
              <span className="ml-1 font-sans text-[10px] text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 色の挿入 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">色を挿入</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={`${c.label}を挿入`}
              onClick={() => insertAtCursor(shell === "bash" ? c.bash : c.zsh)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2 py-1 text-xs text-secondary-foreground transition-colors hover:bg-muted"
            >
              <span className="size-3 rounded-full" style={{ backgroundColor: c.hex }} />
              {c.label}
            </button>
          ))}
          <button
            type="button"
            title="リセット (色を戻す)"
            onClick={insertReset}
            className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-xs text-secondary-foreground transition-colors hover:bg-muted"
          >
            reset
          </button>
        </div>
      </div>
    </div>
  )
}
