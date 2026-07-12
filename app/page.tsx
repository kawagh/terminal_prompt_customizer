"use client"

import { useEffect, useState } from "react"
import { SquareTerminal } from "lucide-react"
import type { Shell } from "@/lib/ps1"
import type { Preset } from "@/lib/presets"
import { decodeState, encodeState } from "@/lib/share"
import { PromptEditor } from "@/components/prompt-editor"
import { TerminalPreview } from "@/components/terminal-preview"
import { PresetGrid } from "@/components/preset-grid"
import { SnippetOutput } from "@/components/snippet-output"
import { EscapeReference } from "@/components/escape-reference"
import { ShareBar } from "@/components/share-bar"

const DEFAULT_BASH = "\\[\\e[1;32m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]\\$ "
const DEFAULT_ZSH = "%F{green}%n@%m%f:%F{blue}%~%f%# "

export default function Page() {
  const [shell, setShell] = useState<Shell>("bash")
  const [value, setValue] = useState<string>(DEFAULT_BASH)
  const [showOutput, setShowOutput] = useState<boolean>(true)
  const [hydrated, setHydrated] = useState(false)

  // 初回: URL ハッシュから状態を復元
  useEffect(() => {
    const shared = decodeState(window.location.hash)
    if (shared) {
      setShell(shared.shell)
      setValue(shared.value)
    }
    setHydrated(true)
  }, [])

  // 状態変化時: URL ハッシュに反映 (共有可能に保つ)
  useEffect(() => {
    if (!hydrated) return
    const hash = "#" + encodeState({ shell, value })
    window.history.replaceState(null, "", hash)
  }, [shell, value, hydrated])

  const switchShell = (next: Shell) => {
    if (next === shell) return
    // 既定値のときは相手シェルの既定値に置き換える
    if (value === DEFAULT_BASH || value === DEFAULT_ZSH || value.trim() === "") {
      setValue(next === "bash" ? DEFAULT_BASH : DEFAULT_ZSH)
    }
    setShell(next)
  }

  const selectPreset = (preset: Preset) => {
    setShell(preset.shell)
    setValue(preset.value)
  }

  const state = { shell, value }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      {/* ヘッダー */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <SquareTerminal className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">
              PS1 プロンプト エディタ
            </h1>
            <p className="text-pretty text-sm text-muted-foreground">
              ターミナルのプロンプトをカスタマイズしてプレビューし、URL で共有できます。
            </p>
          </div>
        </div>
        <ShareBar state={state} />
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左: 編集 */}
        <section className="flex flex-col gap-6">
          {/* シェル切替 + 出力トグル */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {(["bash", "zsh"] as Shell[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => switchShell(s)}
                  className={`rounded-md px-3.5 py-1.5 font-mono text-sm transition-colors ${
                    shell === s
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showOutput}
                onChange={(e) => setShowOutput(e.target.checked)}
                className="size-4 accent-[color:var(--primary)]"
              />
              コマンド出力例を表示
            </label>
          </div>

          <PromptEditor value={value} shell={shell} onChange={setValue} />

          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold text-foreground">エスケープ早見表 ({shell})</h2>
            <EscapeReference shell={shell} />
          </div>
        </section>

        {/* 右: プレビュー + 出力 */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-foreground">プレビュー</h2>
            <TerminalPreview value={value} shell={shell} showOutput={showOutput} />
          </div>
          <SnippetOutput state={state} />
        </section>
      </div>

      {/* プリセット */}
      <section className="mt-10 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">プリセット</h2>
        <PresetGrid onSelect={selectPreset} activeValue={value} />
      </section>

      <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        設定はサーバーに保存されず、URL のハッシュにエンコードされます。URL を共有するだけで同じプロンプトを再現できます。
      </footer>
    </main>
  )
}
