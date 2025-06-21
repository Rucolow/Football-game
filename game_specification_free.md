# 📱 サッカーマネージャーゲーム仕様書（無料版）

## 🎮 ゲーム概要

### 基本コンセプト
- **完全無料**での開発・運用
- **非同期マルチプレイヤー**対応（Firebase無料枠活用）
- **12人リーグ**（18人から縮小、負荷軽減）
- レトロな「ガラケー」風UIデザイン
- **段階的開発**（MVP → 機能追加）

### 技術スタック（すべて無料）
```
フロントエンド:
├── HTML5 + CSS3 + Vanilla JavaScript
├── PWA対応（Service Worker）
├── レスポンシブデザイン
└── LocalStorage（オフライン機能）

バックエンド:
├── Firebase Realtime Database（無料枠）
├── Firebase Authentication（無料枠）
├── Firebase Hosting（無料枠）
└── GitHub Actions（CI/CD無料）

ホスティング:
├── GitHub Pages（開発版）
├── Firebase Hosting（本番版）
└── Netlify（バックアップ）
```

## 🎯 無料枠制限に対応した設計

### Firebase無料枠制限
```
制限事項:
├── 同時接続: 100人
├── データベース: 1GB
├── 帯域幅: 10GB/月
├── 認証: 無制限（無料）
└── ホスティング: 10GB

対応可能規模:
├── 同時アクティブ: 50-80人
├── 登録ユーザー: 500-1000人
├── 月間プレイヤー: 200-400人
└── リーグ数: 20-40個
```

### ゲーム設計の調整
```
18人リーグ → 12人リーグ
├── データ量: 33%削減
├── 同時接続: 33%削減
├── 計算負荷: 50%削減
└── 無料枠内で安定運用
```

## 📅 段階的開発プラン

### Phase 1: オフライン版（完全無料）
**期間**: 2ヶ月
**技術**: HTML + CSS + JavaScript + LocalStorage

```
実装機能:
├── シングルプレイヤーモード
├── 12チームリーグ（11NPC）
├── 選手・監督データベース（軽量化）
├── 戦術システム（簡素化：12フォーメーション×3攻撃×3守備=108通り）
├── 試合計算エンジン
├── 成長システム（基本版）
├── 自動編成システム（3種類）
└── PWA対応
```

### Phase 2: オンライン対応（Firebase無料）
**期間**: 1ヶ月
**技術**: Firebase追加

```
追加機能:
├── Firebase Authentication
├── オンラインリーグ参加
├── リアルタイム順位表
├── 他プレイヤー情報閲覧
├── 簡易チャット（定型文）
└── プッシュ通知
```

### Phase 3: 機能拡張（継続開発）
**期間**: 継続
**技術**: 既存スタック活用

```
拡張機能:
├── 統計機能強化
├── UI/UXアニメーション
├── 音声システム
├── 実績システム
├── ランキング機能
└── コミュニティ機能
```

## 🎮 簡素化された仕様

### リーグシステム（12人制）
```
構成:
├── 総チーム数: 12チーム
├── 人間プレイヤー: 1-12人
├── NPCチーム: 残り補充
├── 試合数: 22節（11×2）
├── 上位: 3チームプレーオフ
└── シーズン期間: 25日（7+22+3）
```

### 簡素化データ構造
```javascript
// 最小限のデータ構造
const gameData = {
  // プレイヤーデータ（軽量化）
  player: {
    id: "user123",
    name: "プレイヤー名",
    team: {
      name: "チーム名",
      coach: { id: 1, abilities: [8,7,9,6] }, // [カリスマ,共感,指導力,運]
      players: [
        { id: 1, pos: "GK", abilities: [5,7,8,6,9,5], age: 25 },
        // ... 19名（20名編成）
      ],
      tactics: { formation: 1, attack: 1, defense: 1 } // 簡素化
    }
  },
  
  // リーグデータ（共有）
  league: {
    id: "league001",
    season: 1,
    day: 15,
    teams: [], // 12チーム分
    matches: [], // 当日の試合のみ
    standings: [] // 順位表
  }
};
```

### 自動編成システム（簡素化）
```javascript
// 3種類の自動編成タイプ
const autoFormationTypes = {
  random: {
    name: "⚡ おまかせ編成",
    description: "30秒で完了！バランス良くランダム編成",
    algorithm: "完全ランダム",
    budget: {
      coach: 0.1,    // 予算の10%
      star: 0.3,     // 30%（スター1-2名）
      excellent: 0.4, // 40%（優秀選手）
      regular: 0.2    // 20%（普通選手）
    }
  },
  balanced: {
    name: "🎯 バランス編成", 
    description: "各ポジション均等配分の安定型",
    algorithm: "ポジション均等",
    formation: "4-4-2" // デフォルト
  },
  offensive: {
    name: "🔥 攻撃重視編成",
    description: "FW・MFに予算集中の得点重視型",
    algorithm: "FW/MF重視",
    formation: "4-3-3" // 攻撃的
  }
};
```

## 🖥️ UI/UX設計（軽量化）

### デザイン原則
- **軽量化**: 画像最小限、CSS重視
- **オフライン対応**: キャッシュ活用
- **モバイルファースト**: タッチ最適化
- **レトロ風**: ピクセルアート風CSS

### 画面構成（簡素化）
```
必須画面のみ:
├── 🏠 ホーム（現在状況）
├── 👥 チーム編成（ドラッグ&ドロップ）
├── ⚽ 戦術設定（ビジュアル）
├── 📊 順位表（リアルタイム）
├── 🎯 試合結果（シンプル表示）
└── ⚙️ 設定（音声・通知）

削除する画面:
├── 複雑な統計画面
├── 詳細な選手情報画面
├── 高度なチャット機能
└── 複雑なアニメーション
```

### CSS設計（軽量）
```css
/* 軽量化のポイント */
:root {
  /* CSS変数で色管理 */
  --primary: #2d5a27;
  --secondary: #4a7c59;
  --accent: #76c7c0;
  --bg: #f0f4f0;
  --text: #2c3e2d;
}

/* 画像なしでアイコン作成 */
.icon-soccer::before {
  content: "⚽";
  font-size: 1.2em;
}

/* レスポンシブ対応 */
.container {
  max-width: 400px;
  margin: 0 auto;
  padding: 1rem;
}
```

## 📡 Firebase実装設計

### データベース構造（最適化）
```javascript
// Firebase Realtime Database
{
  "leagues": {
    "league001": {
      "info": { "name": "League 1", "day": 15, "maxPlayers": 12 },
      "teams": {
        "team001": { "name": "Team A", "player": "user123", "points": 25 },
        "team002": { "name": "Team B", "npc": true, "points": 22 }
      },
      "matches": {
        "day15": [
          { "home": "team001", "away": "team002", "score": "2-1" }
        ]
      },
      "standings": [
        { "teamId": "team001", "rank": 1, "points": 25 }
      ]
    }
  },
  
  "players": {
    "user123": {
      "profile": { "name": "Player", "email": "user@example.com" },
      "team": { "coach": {}, "players": [], "tactics": {} },
      "stats": { "wins": 10, "losses": 5 }
    }
  }
}
```

### API設計（RESTful）
```javascript
// 軽量なAPI呼び出し
const API = {
  // リーグ参加
  joinLeague: (leagueId, teamData) => 
    firebase.database().ref(`leagues/${leagueId}/teams`).push(teamData),
  
  // 戦術更新
  updateTactics: (playerId, tactics) =>
    firebase.database().ref(`players/${playerId}/team/tactics`).set(tactics),
  
  // 順位表取得
  getStandings: (leagueId) =>
    firebase.database().ref(`leagues/${leagueId}/standings`).once('value'),
  
  // 試合結果取得
  getMatches: (leagueId, day) =>
    firebase.database().ref(`leagues/${leagueId}/matches/day${day}`).once('value')
};
```

## 💡 ゲームバランス設計

### 予算バランス（28億KR）
```javascript
// 28億KRでの推奨配分例
const budgetExamples = {
  balanced: {
    coach: "2億KR (7%)",
    star: "8億KR (29%) - スター選手2名", 
    excellent: "12億KR (43%) - 優秀選手8名",
    regular: "6億KR (21%) - 普通選手10名"
  },
  starFocused: {
    coach: "1億KR (4%)",
    star: "15億KR (54%) - スター選手3名",
    excellent: "8億KR (29%) - 優秀選手5名", 
    regular: "4億KR (14%) - 普通選手12名"
  },
  youth: {
    coach: "3億KR (11%) - 成長重視監督",
    star: "4億KR (14%) - 若手スター1名",
    excellent: "12億KR (43%) - 若手優秀選手",
    regular: "9億KR (32%) - 若手普通選手"
  }
};
```

### 戦術簡素化
```javascript
// 432通り → 108通りに簡素化
const tactics = {
  formations: 12,     // 変更なし
  attacks: 3,         // 6→3に削減
  defenses: 3,        // 6→3に削減
  total: 12 * 3 * 3   // = 108通り
};

// 攻撃戦術（簡素化）
const attackTypes = {
  fast: "速攻",      // カウンター重視
  balanced: "バランス", // 標準的な攻撃
  possession: "ポゼッション" // ボール保持重視
};

// 守備戦術（簡素化） 
const defenseTypes = {
  press: "プレッシング", // 高い位置でプレス
  balanced: "バランス",   // 標準的な守備
  retreat: "リトリート"   // 引いて守る
};
```

## 📊 成功指標

### 無料版での目標
```
3ヶ月目標:
├── 登録ユーザー: 100人
├── アクティブユーザー: 50人
├── リーグ数: 10個
└── ユーザー満足度: 4.0/5.0

6ヶ月目標:
├── 登録ユーザー: 500人
├── アクティブユーザー: 200人
├── リーグ数: 30個
└── 口コミ拡散開始
```

## ⚡ 実装優先順位（無料版）

### 最優先（Phase 1）
1. ✅ 基本HTML/CSS/JS構造
2. ✅ ローカルゲームエンジン
3. ✅ シングルプレイヤーモード
4. ✅ 自動編成システム
5. ✅ PWA対応

### 中優先（Phase 2）
6. 🔄 Firebase統合
7. 🔄 認証システム
8. 🔄 オンラインリーグ
9. 🔄 リアルタイム更新
10. 🔄 基本チャット

### 低優先（Phase 3）
11. ⏸️ アニメーション
12. ⏸️ 音声システム
13. ⏸️ 統計機能
14. ⏸️ 実績システム
15. ⏸️ 収益化機能

## 🚀 まとめ

この仕様により**完全無料**で以下が実現可能：

### ✅ 実現可能
- 12人マルチプレイヤー
- 全コア機能
- PWA対応
- リアルタイム更新
- モバイル最適化

### 📊 制約事項
- 同時接続100人以下
- カスタムドメインなし
- 高度な機能は後回し

### 🎯 成功の鍵
**段階的開発 + コミュニティ重視 + 継続改善**