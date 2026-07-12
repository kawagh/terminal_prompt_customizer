import { useState } from "react"
import { Check, Link2 } from "lucide-react"
import { buildShareUrl, type SharedState } from "@/lib/share"

export function ShareBar({ state }: { state: SharedState }) {
  const [copied, setCopied] = useState(false)

  const copyUrl = async () => {
    const url = buildShareUrl(state)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // 何もしない
    }
  }

  return (
    <button
      type="button"
      onClick={copyUrl}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
    >
      {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      {copied ? "URL をコピーしました" : "共有 URL をコピー"}
    </button>
  )
}
