# ccrun

## 概要

`ccrun` は、Anthropic Claude Code APIをCLIから簡単に利用できるTypeScript製コマンドラインツールです。

---

## 使い方

### 1. 依存パッケージのインストール

``` bash
npm install
```

### 2. ビルド（初回のみ）

```bash
npm run build
```

### 3. CLIとして直接実行

TypeScriptファイルを直接実行する場合：

```bash
npm run dev -- -i "こんにちは"
```

または、ビルド後のJavaScriptファイルを実行：

```bash
npm start -- -i "こんにちは"
```

#### 主なオプション

- `-i, --input <prompt>`: 直接プロンプトを指定
- `-f, --file <file>`: ファイルからプロンプトを読み込む
- `--max-turns <number>`: 最大ターン数を指定
- `-c, --continue`: セッションを継続
- `--resume <session-id>`: セッションIDから再開
- `--allowedTools <tools>`: 許可するツールをカンマ区切りで指定
- `--disallowedTools <tools>`: 禁止するツールをカンマ区切りで指定
- `-h, --help`: ヘルプを表示

---

## グローバルコマンドとして使う方法

プロジェクトルートで以下を実行：

```bash
npm run build
npm link
```

これで、どのディレクトリからでも `ccrun` コマンドとして利用できます。

例：

```bash
ccrun -i "こんにちは"
```

---

## 設定ファイル

`.claude/settings.json` または `.claude/settings.local.json` に設定を書くことができます：

```json
{
  "permissions": {
    "allow": ["Read", "Write"],
    "deny": ["Edit"]
  }
}
```

---

## 注意事項

- Node.js v18以上推奨
- @anthropic-ai/claude-code パッケージが必要

---

## ライセンス

MIT 