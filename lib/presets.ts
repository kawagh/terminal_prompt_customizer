import type { Shell } from "./ps1"

export interface Preset {
  name: string
  description: string
  shell: Shell
  value: string
}

export const PRESETS: Preset[] = [
  {
    name: "Ubuntu 標準",
    description: "おなじみの緑ユーザー名・青パス",
    shell: "bash",
    value: "\\[\\e[1;32m\\]\\u@\\h\\[\\e[0m\\]:\\[\\e[1;34m\\]\\w\\[\\e[0m\\]\\$ ",
  },
  {
    name: "ミニマル",
    description: "カレントディレクトリと記号だけ",
    shell: "bash",
    value: "\\[\\e[36m\\]\\W\\[\\e[0m\\] \\$ ",
  },
  {
    name: "矢印 (2行)",
    description: "上段に情報、下段に入力",
    shell: "bash",
    value: "\\[\\e[32m\\]\\u@\\h\\[\\e[0m\\] \\[\\e[33m\\]\\w\\[\\e[0m\\]\\n\\[\\e[35m\\]\\$\\[\\e[0m\\] ",
  },
  {
    name: "モダン ❯",
    description: "パスと矢印プロンプト",
    shell: "bash",
    value: "\\[\\e[36m\\]\\w\\[\\e[0m\\] \\[\\e[1;35m\\]\\$\\[\\e[0m\\] ",
  },
  {
    name: "タイムスタンプ",
    description: "先頭に時刻を表示",
    shell: "bash",
    value: "\\[\\e[90m\\][\\t]\\[\\e[0m\\] \\[\\e[1;34m\\]\\W\\[\\e[0m\\]\\$ ",
  },
  {
    name: "root 警告",
    description: "赤で目立たせる管理者向け",
    shell: "bash",
    value: "\\[\\e[1;41;97m\\] \\u \\[\\e[0m\\]\\[\\e[31m\\] \\w \\[\\e[0m\\]# ",
  },
  {
    name: "256色 グラデ風",
    description: "拡張256色を使った例",
    shell: "bash",
    value: "\\[\\e[38;5;208m\\]\\u\\[\\e[38;5;245m\\]@\\[\\e[38;5;39m\\]\\h \\[\\e[38;5;220m\\]\\w\\[\\e[0m\\] \\$ ",
  },
  {
    name: "zsh 標準",
    description: "zsh の %記法によるカラー",
    shell: "zsh",
    value: "%F{green}%n@%m%f:%F{blue}%~%f%# ",
  },
  {
    name: "zsh 矢印",
    description: "パスと太字の矢印",
    shell: "zsh",
    value: "%F{cyan}%~%f %B%F{magenta}❯%f%b ",
  },
  {
    name: "zsh 2行",
    description: "情報行と入力行を分離",
    shell: "zsh",
    value: "%F{green}%n@%m %F{yellow}%~%f\n%F{magenta}%#%f ",
  },
]
