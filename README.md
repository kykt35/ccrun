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
- `-o, --output`: 自動生成ファイル名で出力を有効化
- `--output-file <file>`: 出力ファイルパス指定（明示的）
- `--output-enabled`: 出力を有効化（`--output`と同じ）
- `--output-dir <directory>`: 出力ディレクトリ指定（デフォルト: ./tmp/ccrun/results）
- `--output-format <format>`: 出力形式（json|text、デフォルト: json）
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

#### ファイル出力機能

実行結果をファイルに出力します。**デフォルトでは出力は無効**で、明示的に有効化する必要があります。

```bash
# 出力を有効化（自動生成ファイル名: ./tmp/ccrun/results/yyyyMMddHHmmss.json）
ccrun -i "コードを分析して" --output

# 短縮形でも同様
ccrun -i "コードを分析して" -o

# 指定ファイルに保存
ccrun -i "コードを分析して" --output-file results.json

# 明示的な出力ファイル指定
ccrun -i "コードを分析して" --output-file results.json

# カスタムディレクトリに保存
ccrun -i "コードを分析して" --output --output-dir ./output

# テキスト形式で保存
ccrun -i "バグを修正して" -o results.txt --output-format text

# 出力無効化（デフォルト動作、コンソール出力のみ）
ccrun -i "コードを分析して"

# 複数のオプションを組み合わせ
ccrun -f input.txt --output --output-dir ./results --output-format json
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

`.ccrun/settings.json` または `.ccrun/settings.local.json` に設定を書くことができます：

```json
{
  "permissions": {
    "allow": ["Read", "Write"],
    "deny": ["Edit"]
  },
  "maxTurns": 25,
  "outputFile": "./results/output.json",
  "outputFormat": "json",
  "output": {
    "enabled": true,
    "directory": "./results",
    "filename": {
      "prefix": "ccrun-",
      "suffix": "-result"
    }
  }
}
```

### カスタム設定ファイル

`--settingFile` オプションで任意の設定ファイルを指定できます：

```bash
ccrun -i "プロンプト" --settingFile ./custom-settings.json
```

### 設定ファイルの優先度

1. **最優先**: `--settingFile`で指定されたファイル
2. **次優先**: `.ccrun/settings.local.json`
3. **最後**: `.ccrun/settings.json`

### 設定ファイルの形式

#### 例1: outputFileを使用した直接ファイル指定

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"],
    "deny": ["Bash", "WebFetch"]
  },
  "maxTurns": 50,
  "outputFile": "./project-results/analysis.txt",
  "outputFormat": "text"
}
```

#### 例2: outputでの自動生成設定

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"],
    "deny": ["Bash", "WebFetch"]
  },
  "maxTurns": 50,
  "outputFormat": "json",
  "output": {
    "enabled": true,
    "directory": "./project-results",
    "filename": {
      "prefix": "analysis-",
      "suffix": "-report"
    }
  }
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
  "maxTurns": 30,
  "outputFile": "./tmp/output.json",
  "outputFormat": "json",
  "output": {
    "enabled": true,
    "directory": "./tmp/test",
    "filename": {
      "prefix": "test",
      "suffix": "suf"
    }
  }
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

## ファイル出力機能

### 出力形式

ccrunは2つの出力形式をサポートしています：

#### JSON形式（デフォルト）
Claude Code SDKの標準形式（SDKResultMessage）に準拠した構造化データ形式です。

```json
{
  "result": {
    "type": "result",
    "subtype": "success",
    "duration_ms": 2500,
    "duration_api_ms": 2100,
    "is_error": false,
    "num_turns": 3,
    "result": "実行結果の内容",
    "session_id": "session-abc123",
    "total_cost_usd": 0.0042,
    "usage": {
      "input_tokens": 1250,
      "output_tokens": 380,
      "total_tokens": 1630
    }
  },
  "metadata": {
    "timestamp": "2025-07-09T12:34:56.789Z",
    "config": {
      "maxTurns": 10,
      "allowedTools": ["Read", "Write"]
    }
  }
}
```

#### テキスト形式

人間が読みやすい日本語レポート形式です。

```text
==========================================
CCRun 実行結果レポート
==========================================

実行時刻: 2025-07-09 12:34:56
セッションID: session-abc123
ステータス: 成功 (success)

パフォーマンス情報:
  実行時間: 2500ms
  API時間: 2100ms
  ターン数: 3
  推定コスト: $0.0042

トークン使用量:
  入力トークン: 1250
  出力トークン: 380
  合計トークン: 1630

結果:
実行結果の内容

==========================================
```

### 出力設定

#### 設定項目

- **outputFile**: 出力ファイルパス（設定されていると自動的に出力が有効化）
- **outputFormat**: 出力形式（`json` または `text`）
- **output.enabled**: ファイル出力の有効/無効
- **output.directory**: 自動生成時の出力ディレクトリ
- **output.filename.prefix**: 自動生成時のファイル名プレフィックス
- **output.filename.suffix**: 自動生成時のファイル名サフィックス

#### 優先順位

1. **最優先**: CLI引数（`--output-file`, `-o`, `--output`, `--output-enabled`）
2. **次優先**: 設定ファイルの `outputFile`
3. **その次**: 設定ファイルの `output.enabled: true`（自動生成）
4. **最後**: デフォルト値（出力無効）

### デフォルト動作

- **出力有効化**: デフォルトでは無効（明示的に有効化が必要）
- **出力先**: `./tmp/ccrun/results/`
- **ファイル名**: `yyyyMMddHHmmss.json`形式（実行開始時刻）
- **出力形式**: JSON
- **ディレクトリ作成**: 指定された出力ディレクトリが存在しない場合は自動作成

---

## 注意事項

- Node.js v18以上推奨
- @anthropic-ai/claude-code パッケージが必要

---

## ライセンス

MIT