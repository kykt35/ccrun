# ccrun

## 概要

`ccrun` は、Anthropic Claude Code APIをCLIから簡単に利用できるTypeScript製コマンドラインツールです。

---

## 使い方

### 1. リポジトリのクローン

```bash
git clone https://github.com/kykt35/ccrun.git
cd ccrun
```

### 2. 依存パッケージのインストール

``` bash
npm install
```

### 3. ビルド（初回のみ）

```bash
npm run build
```

### 4. CLIとして直接実行

TypeScriptファイルを直接実行する場合：

```bash
npm run exec -- -i "こんにちは"
```

#### 主なオプション

- `-i, --input <prompt>`: 直接プロンプトを指定
- `-f, --file <file>`: ファイルからプロンプトを読み込む
- `--max-turns <number>`: 最大ターン数を指定
- `-c, --continue`: セッションを継続
- `--resume <session-id>`: セッションIDから再開
- `--allowedTools <tools>`: 許可するツールをカンマ区切りで指定
- `--disallowedTools <tools>`: 禁止するツールをカンマ区切りで指定
- `--settingFile <filePath>`, `-s <filePath>`: 設定ファイルを指定
- `-h, --help`: ヘルプを表示

### 使用例

#### 基本的な使用方法

```bash
# 直接プロンプトを指定
ccrun -i "TypeScriptのコードを書いてください"

# ファイルからプロンプトを読み込む
ccrun -f prompt.txt

# ヘルプを表示
ccrun -h
```

#### セッション管理

```bash
# 前のセッションを継続
ccrun --continue -i "さらに詳しく説明してください"

# 特定のセッションを再開
ccrun --resume abc123 -i "追加の質問があります"
```

#### ツール制限

```bash
# 特定のツールのみ許可
ccrun -i "ファイルを読み込んでください" --allowedTools "Read,Write"

# 特定のツールを禁止
ccrun -i "コードを実行してください" --disallowedTools "Bash"

# 複数のツールを組み合わせ
ccrun -i "プロジェクトを分析してください" --allowedTools "Read,Grep,Glob" --disallowedTools "Write,Edit"
```

#### 設定ファイルの使用

```bash
# カスタム設定ファイルを指定
ccrun -i "ファイルを読み込んでください" --settingFile ./my-settings.json

# 短縮形も使用可能
ccrun -i "プロジェクトを分析してください" -s ../shared-settings.json
```

#### その他のオプション

```bash
# 最大ターン数を制限
ccrun -i "長い議論をしましょう" --max-turns 10

# 複数のオプションを組み合わせ
ccrun -f input.txt --continue --max-turns 5 --allowedTools "Read,Write"
```

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

### デフォルト設定ファイル

`.claude/settings.json` または `.claude/settings.local.json` に設定を書くことができます：

```json
{
  "permissions": {
    "allow": ["Read", "Write"],
    "deny": ["Edit"]
  },
  "maxTurns": 25
}
```

### カスタム設定ファイル

`--settingFile` オプションで任意の設定ファイルを指定できます：

```bash
ccrun -i "プロンプト" --settingFile ./custom-settings.json
```

### 設定ファイルの優先度

1. **最優先**: `--settingFile`で指定されたファイル
2. **次優先**: `.claude/settings.local.json`
3. **最後**: `.claude/settings.json`

### 設定ファイルの形式

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"],
    "deny": ["Bash", "WebFetch"]
  },
  "maxTurns": 50
}
```

### 設定ファイルの例

プロジェクトには設定ファイル例が含まれています：

#### 設定例 (`.ccrun/settings.example.json`)

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "LS"],
    "deny": ["Bash", "WebFetch", "WebSearch"]
  },
  "maxTurns": 30
}
```

#### 使用例

```bash
# 設定例を使用
ccrun -i "コードを分析してください" --settingFile .ccrun/settings.example.json

# 設定例をコピーして独自の設定を作成
cp .ccrun/settings.example.json .ccrun/settings.local.json
ccrun -i "プロンプト" --settingFile .ccrun/settings.local.json
```

---

## 注意事項

- Node.js v18以上推奨
- @anthropic-ai/claude-code パッケージが必要

---

## ライセンス

MIT 