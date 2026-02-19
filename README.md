# Simple Video Joiner

複数の動画ファイルを選択・並び替えて結合するAndroidアプリ。

## セットアップ

```bash
cd SimpleVideoJoiner
npm install
```

## 開発サーバー起動

```bash
npx expo start
```

## APKビルド手順

```bash
# 1. Expo アカウントにログイン
npx eas login

# 2. プロジェクト初期化 (初回のみ)
npx eas init
# → 生成された projectId を app.json の extra.eas.projectId に記入

# 3. APK ビルド
npx eas build --platform android --profile preview

# 4. ビルド完了後、表示された URL から APK をダウンロード
```

## 機能

- 複数動画の選択 (expo-image-picker)
- ドラッグ不要の上下ボタンで順序変更
- 圧縮レベル選択 (低/中/高)
- 推定出力サイズ・時間の表示
- FFmpeg (concat demuxer) による再エンコード結合
- 進捗バー表示
- ギャラリー「SimpleVideoJoiner」アルバムへの自動保存

## 技術スタック

| ライブラリ | 用途 |
|---|---|
| ffmpeg-kit-react-native | 動画結合処理 |
| expo-image-picker | 動画選択 |
| expo-media-library | ギャラリー保存 |
| expo-file-system | ファイル操作 |

## 注意事項

- APKサイズが ffmpeg-kit により 30〜50MB 増加します
- 異なる解像度・FPS の動画は自動的に再エンコードされます
- Android 13+ では `READ_MEDIA_VIDEO` 権限が必要です (app.json に設定済み)
