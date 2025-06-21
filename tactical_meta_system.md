# 戦術相性システム設計

## 🎯 基本設計思想

### 戦術メタゲームの構造
現実のサッカーと同様に、戦術には相性がある。プレイヤーは相手の戦術を分析し、対策を練る楽しさを体験できる。

```
📊 相性システムの3層構造:
1. 攻撃 vs 守備の基本相性
2. 同系統戦術の細かな相性
3. フォーメーションとの組み合わせ効果
```

---

## ⚔️ 攻撃vs守備 基本相性マトリックス

### 相性効果表
```javascript
const tacticalMatrix = {
    // 攻撃戦術 vs 守備戦術の相性
    'counter': {        // 速攻重視
        'pressing': 0.85,    // プレッシングに弱い（ボール奪われる）
        'solid': 1.20,       // 堅守に強い（隙を突ける）
        'teamwork': 1.00,    // 連携重視に普通
        'manmark': 1.15,     // マンマークに強い（スピードで振り切れる）
        'counter_def': 0.90, // カウンター狙いに弱い（読まれやすい）
        'reading': 1.05      // 読み勝負に少し強い
    },
    'possession': {     // ポゼッション
        'pressing': 1.25,    // プレッシングに強い（技術で回避）
        'solid': 0.85,       // 堅守に弱い（崩しにくい）
        'teamwork': 1.15,    // 連携重視に強い（技術で上回る）
        'manmark': 0.90,     // マンマークに弱い（個人で止められる）
        'counter_def': 1.10, // カウンター狙いに強い（ボール支配）
        'reading': 0.95      // 読み勝負に少し弱い
    },
    'side': {           // サイド攻撃
        'pressing': 1.10,    // プレッシングに強い（サイドで回避）
        'solid': 1.00,       // 堅守に普通
        'teamwork': 0.90,    // 連携重視に弱い（組織で対応される）
        'manmark': 1.20,     // マンマークに強い（サイドで数的優位）
        'counter_def': 1.05, // カウンター狙いに少し強い
        'reading': 1.00      // 読み勝負に普通
    },
    'center': {         // 中央突破
        'pressing': 0.95,    // プレッシングに少し弱い
        'solid': 1.10,       // 堅守に強い（技術で崩す）
        'teamwork': 1.20,    // 連携重視に強い（個人技で打破）
        'manmark': 0.80,     // マンマークに弱い（個人で止められる）
        'counter_def': 1.00, // カウンター狙いに普通
        'reading': 0.85      // 読み勝負に弱い（コースを読まれる）
    },
    'power': {          // パワープレー
        'pressing': 1.05,    // プレッシングに少し強い
        'solid': 1.25,       // 堅守に強い（フィジカルで押し切る）
        'teamwork': 0.90,    // 連携重視に弱い（組織で対応される）
        'manmark': 1.10,     // マンマークに強い（フィジカルで勝る）
        'counter_def': 0.85, // カウンター狙いに弱い（スピード不足）
        'reading': 1.15      // 読み勝負に強い（力押し）
    },
    'individual': {     // 個人技
        'pressing': 0.90,    // プレッシングに弱い（複数で囲まれる）
        'solid': 0.95,       // 堅守に少し弱い
        'teamwork': 1.30,    // 連携重視に強い（個人技で打破）
        'manmark': 0.75,     // マンマークに弱い（1対1で止められる）
        'counter_def': 1.05, // カウンター狙いに少し強い
        'reading': 0.80      // 読み勝負に弱い（動きを読まれる）
    }
};
```

---

## 🔄 同系統戦術内の相性

### 攻撃戦術同士の相性
```javascript
const attackVsAttackMeta = {
    // 相手も攻撃的な場合の相性
    'counter': {
        'possession': 1.10,   // ポゼッション相手には速攻が有効
        'power': 1.15,        // パワープレー相手にはスピードで
        'individual': 0.95    // 個人技相手には普通
    },
    'possession': {
        'counter': 0.90,      // 速攻相手にはボール支配で対抗
        'side': 1.05,         // サイド攻撃相手には中央支配で
        'power': 1.20         // パワープレー相手には技術で
    },
    'individual': {
        'teamwork_attack': 1.25, // 連携攻撃には個人技で崩す
        'possession': 1.10,      // ポゼッション相手には個人技で
        'counter': 1.05          // 速攻相手には個人技で崩す
    }
};
```

### 守備戦術同士の相性
```javascript
const defenseVsDefenseMeta = {
    // 相手も守備的な場合、攻撃機会の奪い合い
    'pressing': {
        'solid': 1.15,        // 堅守相手にはプレッシングで
        'reading': 1.10       // 読み勝負相手には積極性で
    },
    'solid': {
        'pressing': 0.85,     // プレッシング相手には我慢比べ
        'counter_def': 0.90   // カウンター狙い相手には先手を
    }
};
```

---

## 🏗️ フォーメーション連動効果

### フォーメーション別戦術ボーナス
```javascript
const formationTacticBonus = {
    '4-3-3': {
        // 攻撃的フォーメーション
        attack_bonus: {
            'side': 1.15,        // サイド攻撃に最適
            'individual': 1.10,  // 個人技も活かしやすい
            'counter': 1.05      // 速攻も可能
        },
        defense_penalty: {
            'solid': 0.90,       // 堅守には不向き
            'teamwork': 0.95     // 連携守備も少し苦手
        }
    },
    '4-4-2': {
        // バランス型フォーメーション
        balance_bonus: {
            all_tactics: 1.00,   // 全戦術に対応可能
            stability: 1.05      // 安定性ボーナス
        }
    },
    '5-4-1': {
        // 守備的フォーメーション
        defense_bonus: {
            'solid': 1.20,       // 堅守に最適
            'teamwork': 1.15,    // 連携守備も良い
            'pressing': 1.10     // プレッシングも可能
        },
        attack_penalty: {
            'individual': 0.80,  // 個人技は苦手
            'side': 0.85         // サイド攻撃も制限
        }
    },
    '4-2-3-1': {
        // 中盤重視フォーメーション
        midfield_bonus: {
            'possession': 1.20,  // ポゼッションに最適
            'center': 1.15,      // 中央突破も良い
            'teamwork': 1.10     // 連携重視も得意
        }
    },
    '3-5-2': {
        // ウイングバック型
        versatility_bonus: {
            'side': 1.25,        // サイド攻撃に最適
            'counter': 1.10,     // 速攻も得意
            'pressing': 1.05     // プレッシングも可能
        }
    }
};
```

---

## 📊 相性計算システム

### メイン計算関数
```javascript
function calculateTacticalAdvantage(teamA, teamB) {
    const advantageA = {
        attack: 1.0,
        defense: 1.0,
        formation: 1.0,
        overall: 1.0
    };
    
    // 1. 基本戦術相性
    const attackVsDefense = tacticalMatrix[teamA.attackTactic][teamB.defenseTactic];
    const defenseVsAttack = tacticalMatrix[teamB.attackTactic][teamA.defenseTactic];
    
    advantageA.attack = attackVsDefense;
    advantageA.defense = 1 / defenseVsAttack; // 相手の攻撃を防ぐ効果
    
    // 2. フォーメーションボーナス
    const formationBonus = calculateFormationBonus(teamA, teamB);
    advantageA.formation = formationBonus;
    
    // 3. 同系統戦術メタゲーム
    const metaBonus = calculateMetaGameBonus(teamA, teamB);
    advantageA.meta = metaBonus;
    
    // 4. 総合相性
    advantageA.overall = (
        advantageA.attack * 0.4 +
        advantageA.defense * 0.3 +
        advantageA.formation * 0.2 +
        advantageA.meta * 0.1
    );
    
    return {
        teamA: advantageA,
        teamB: {
            attack: 1 / advantageA.defense,
            defense: 1 / advantageA.attack,
            formation: 1 / advantageA.formation,
            meta: 1 / advantageA.meta,
            overall: 1 / advantageA.overall
        }
    };
}
```

### フォーメーションボーナス計算
```javascript
function calculateFormationBonus(teamA, teamB) {
    const formationA = teamA.formation;
    const tacticA = {
        attack: teamA.attackTactic,
        defense: teamA.defenseTactic
    };
    
    let bonus = 1.0;
    
    // 自チームのフォーメーション-戦術相性
    const formationData = formationTacticBonus[formationA];
    if (formationData) {
        // 攻撃戦術ボーナス
        if (formationData.attack_bonus && formationData.attack_bonus[tacticA.attack]) {
            bonus *= formationData.attack_bonus[tacticA.attack];
        }
        
        // 守備戦術ボーナス
        if (formationData.defense_bonus && formationData.defense_bonus[tacticA.defense]) {
            bonus *= formationData.defense_bonus[tacticA.defense];
        }
        
        // ペナルティ
        if (formationData.attack_penalty && formationData.attack_penalty[tacticA.attack]) {
            bonus *= formationData.attack_penalty[tacticA.attack];
        }
        
        if (formationData.defense_penalty && formationData.defense_penalty[tacticA.defense]) {
            bonus *= formationData.defense_penalty[tacticA.defense];
        }
    }
    
    return bonus;
}
```

---

## 🎮 AIチーム戦術選択システム

### AI監督の戦術選択ロジック
```javascript
function selectAITactics(aiTeam, playerTeam, difficulty) {
    // プレイヤーチームの過去の戦術傾向を分析
    const playerTendency = analyzePlayerTactics(playerTeam);
    
    // 難易度による対応力
    const adaptability = {
        'easy': 0.3,      // 30%の確率で最適対策
        'normal': 0.6,    // 60%の確率で最適対策
        'hard': 0.9       // 90%の確率で最適対策
    }[difficulty];
    
    let selectedTactics = {
        formation: aiTeam.preferredFormation,
        attack: aiTeam.preferredAttack,
        defense: aiTeam.preferredDefense
    };
    
    // 対策戦術を選択するかランダム判定
    if (Math.random() < adaptability) {
        selectedTactics = selectCounterTactics(playerTendency, aiTeam);
    }
    
    return selectedTactics;
}

function selectCounterTactics(playerTendency, aiTeam) {
    const counters = {
        // プレイヤーがよく使う戦術への対策
        'counter': {
            bestDefense: 'pressing',      // 速攻にはプレッシング
            bestAttack: 'possession'      // ポゼッションで対抗
        },
        'possession': {
            bestDefense: 'solid',         // ポゼッションには堅守
            bestAttack: 'counter'         // 速攻で対抗
        },
        'individual': {
            bestDefense: 'manmark',       // 個人技にはマンマーク
            bestAttack: 'teamwork'        // 連携攻撃で対抗
        }
    };
    
    const mostUsedAttack = playerTendency.mostUsedAttack;
    const counter = counters[mostUsedAttack];
    
    if (counter && aiTeam.canUse(counter.bestDefense)) {
        return {
            formation: selectCounterFormation(mostUsedAttack),
            attack: counter.bestAttack,
            defense: counter.bestDefense
        };
    }
    
    // 対策できない場合は得意戦術を使用
    return aiTeam.getPreferredTactics();
}
```

---

## 📈 相手チーム分析システム

### 戦術傾向分析
```javascript
function analyzeOpponentTactics(opponent, recentMatches = 5) {
    const analysis = {
        formations: {},
        attacks: {},
        defenses: {},
        patterns: [],
        weaknesses: [],
        strengths: []
    };
    
    // 過去の試合データから傾向を分析
    const recentTactics = opponent.getRecentTactics(recentMatches);
    
    recentTactics.forEach(match => {
        // 使用頻度をカウント
        analysis.formations[match.formation] = 
            (analysis.formations[match.formation] || 0) + 1;
        analysis.attacks[match.attack] = 
            (analysis.attacks[match.attack] || 0) + 1;
        analysis.defenses[match.defense] = 
            (analysis.defenses[match.defense] || 0) + 1;
    });
    
    // パターン認識
    analysis.patterns = detectTacticalPatterns(recentTactics);
    
    // 弱点分析
    analysis.weaknesses = findTacticalWeaknesses(opponent, recentTactics);
    
    return analysis;
}

function detectTacticalPatterns(tactics) {
    const patterns = [];
    
    // 強敵相手では守備的になる傾向
    const strongOpponentTactics = tactics.filter(t => t.opponentStrength > 80);
    if (strongOpponentTactics.length > 0) {
        const defensiveRate = strongOpponentTactics.filter(t => 
            ['solid', 'teamwork'].includes(t.defense)
        ).length / strongOpponentTactics.length;
        
        if (defensiveRate > 0.6) {
            patterns.push({
                type: 'defensive_vs_strong',
                description: '強敵相手では守備的になる傾向',
                probability: defensiveRate
            });
        }
    }
    
    return patterns;
}
```

---

## 🎯 プレイヤー向け情報表示

### 相手分析画面UI
```javascript
// UI表示用の分析結果
function formatTacticalAnalysis(opponent) {
    const analysis = analyzeOpponentTactics(opponent);
    
    return {
        display: {
            title: `${opponent.name}の戦術傾向`,
            mostUsedFormation: getMostUsed(analysis.formations),
            mostUsedAttack: getMostUsed(analysis.attacks),
            mostUsedDefense: getMostUsed(analysis.defenses),
            
            recommendations: [
                `${opponent.name}は${analysis.mostUsedAttack}を多用`,
                `対策: ${getCounterTactic(analysis.mostUsedAttack)}が有効`,
                `注意: ${analysis.strengths[0]}が得意`
            ],
            
            confidence: calculateAnalysisConfidence(analysis)
        }
    };
}
```

### ゲーム内での表示例
```
📊 相手チーム分析: ライバルFC

🔍 戦術傾向 (過去5試合)
フォーメーション: 4-4-2 (80%)
攻撃: ポゼッション (60%)
守備: 連携重視 (80%)

💡 対策提案
✅ 速攻重視 + プレッシング
   → ポゼッションを封じる

⚠️ 注意点
• 中盤での技術が高い
• セットプレーが得意
• 粘り強い守備

📈 信頼度: 85%
```

---

## 🎲 ランダム要素との調和

### 相性効果の適用
```javascript
function applyTacticalAdvantage(baseTeamPower, tacticalAdvantage, randomFactor) {
    // 戦術相性は±20%の範囲で影響
    const tacticalEffect = Math.max(0.8, Math.min(1.2, tacticalAdvantage));
    
    // ランダム要素は±15%
    const randomEffect = 0.85 + (Math.random() * 0.3);
    
    // 最終的なチーム力
    const finalPower = baseTeamPower * tacticalEffect * randomEffect;
    
    return {
        base: baseTeamPower,
        tactical: baseTeamPower * tacticalEffect,
        final: finalPower,
        tacticalBonus: (tacticalEffect - 1) * 100,
        randomBonus: (randomEffect - 1) * 100
    };
}
```

---

*「戦術を読み、対策を練る。真のサッカー監督体験」*