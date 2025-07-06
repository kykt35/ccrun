// Jest セットアップファイル
// テスト実行前の共通設定

// グローバルタイムアウト設定
jest.setTimeout(10000);

// コンソール出力の抑制（必要に応じて）
// const originalConsoleLog = console.log;
// const originalConsoleError = console.error;
//
// beforeAll(() => {
//   console.log = jest.fn();
//   console.error = jest.fn();
// });
//
// afterAll(() => {
//   console.log = originalConsoleLog;
//   console.error = originalConsoleError;
// });

// テスト後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// グローバルエラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});