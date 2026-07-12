import { useMemo } from "react"
import type { CSSProperties } from "react"
import { PRESETS, type Preset } from "@/lib/presets"
import { parsePrompt, type Token, DEFAULT_CONTEXT } from "@/lib/ps1"

interface PresetGridProps {
  onSelect: (preset: Preset) => void
  activeValue: string
}

function miniStyle(token: Token): CSSProperties {
  const s = token.style
  return {
    color: s.reverse ? "#0c0d10" : s.fg || "#e6e6e6",
    backgroundColor: s.reverse ? s.fg || "#e6e6e6" : s.bg,
    fontWeight: s.bold ? 700 : 400,
    textDecoration: s.underline ? "underline" : undefined,
  }
}

function MiniPreview({ preset }: { preset: Preset }) {
  const tokens = useMemo(() => parsePrompt(preset.value, preset.shell, DEFAULT_CONTEXT), [preset])
  return (
    <div className="overflow-hidden rounded-md bg-[#0c0d10] px-2.5 py-2 font-mono text-xs">
      <span className="whitespace-pre-wrap break-all">
        {tokens.map((t, i) => (
          <span key={i} style={miniStyle(t)}>
            {t.text.replace(/\n/g, " ")}
          </span>
        ))}
      </span>
    </div>
  )
}

export function PresetGrid({ onSelect, activeValue }: PresetGridProps) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {PRESETS.map((preset) => {
        const active = preset.value === activeValue
        return (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelect(preset)}
            className={`flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors ${
              active ? "border-primary bg-primary/10" : "border-border bg-card hover:border-ring hover:bg-muted/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{preset.name}</span>
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                {preset.shell}
              </span>
            </div>
            <MiniPreview preset={preset} />
            <span className="text-xs text-muted-foreground">{preset.description}</span>
          </button>
        )
      })}
    </div>
  )
}
