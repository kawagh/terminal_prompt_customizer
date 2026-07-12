import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { buildSnippet, type SharedState } from "@/lib/share"

interface SnippetOutputProps {
  state: SharedState
}

export function SnippetOutput({ state }: SnippetOutputProps) {
  const [copied, setCopied] = useState(false)
  const snippet = buildSnippet(state)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {state.shell === "bash" ? "~/.bashrc 用スニペット" : "~/.zshrc 用スニペット"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          {copied ? <Check className="size-3.5 text-[#4e9a06]" /> : <Copy className="size-3.5" />}
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-[#0c0d10] p-3 font-mono text-xs leading-relaxed text-[#e6e6e6]">
        <code>{snippet}</code>
      </pre>
    </div>
  )
}
