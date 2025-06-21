# サッカーゲーム 試合計算式

## ⚽ 基本設計思想

### 🎯 **目標とする試合結果**
- **一般的なスコア**: 0-0 ～ 3-2 程度が多発
- **大差**: 4-0, 5-1 程度が稀に発生
- **最大差**: 6-0 が絶対的上限
- **引き分け**: 全試合の25-30%程度

### 📊 **リアルサッカーの得点分布**
```
0-0: 8%    1-0: 20%   2-0: 15%   3-0: 8%    4-0: 3%    5-0: 1%    6-0: 0.5%
0-1: 20%   1-1: 12%   2-1: 18%   3-1: 10%   4-1: 2%    5-1: 0.5%
0-2: 15%   1-2: 18%   2-2: 8%    3-2: 5%    4-2: 1%
0-3: 8%    1-3: 10%   2-3: 5%    3-3: 2%
```

---

## 🧮 Step 1: チーム戦力の算出

### 個別選手の戦術適性値計算
```javascript
// 攻撃戦術適性値の計算
function calculateAttackPower(player, attackTactic) {
    const { speed, power, technique, stamina, iq, luck } = player.abilities;
    
    let baseValue = 0;
    switch(attackTactic) {
        case 'counter':     // 速攻重視
            baseValue = speed * 0.4 + iq * 0.3 + stamina * 0.2 + luck * 0.1;
            break;
        case 'possession':  // ポゼッション
            baseValue = technique * 0.4 + iq * 0.35 + stamina * 0.15 + luck * 0.1;
            break;
        case 'side':        // サイド攻撃
            baseValue = speed * 0.35 + technique * 0.25 + stamina * 0.25 + luck * 0.15;
            break;
        case 'center':      // 中央突破
            baseValue = technique * 0.35 + power * 0.25 + iq * 0.25 + luck * 0.15;
            break;
        case 'power':       // パワープレー
            baseValue = power * 0.45 + stamina * 0.25 + speed * 0.15 + luck * 0.15;
            break;
        case 'individual':  // 個人技
            baseValue = technique * 0.5 + luck * 0.3 + speed * 0.15 + iq * 0.05;
            break;
    }
    
    // 性格による補正
    const personalityBonus = getPersonalityBonus(player.personality, attackTactic);
    
    return Math.min(100, baseValue * (1 + personalityBonus));
}

// 守備戦術適性値の計算
function calculateDefensePower(player, defenseTactic) {
    const { speed, power, technique, stamina, iq, luck } = player.abilities;
    
    let baseValue = 0;
    switch(defenseTactic) {
        case 'pressing':    // プレッシング
            baseValue = stamina * 0.35 + speed * 0.3 + iq * 0.2 + power * 0.15;
            break;
        case 'solid':       // 堅守
            baseValue = iq * 0.4 + power * 0.3 + stamina * 0.2 + luck * 0.1;
            break;
        case 'teamwork':    // 連携重視
            baseValue = iq * 0.45 + technique * 0.25 + stamina * 0.2 + luck * 0.1;
            break;
        case 'manmark':     // マンマーク
            baseValue = speed * 0.35 + power * 0.3 + iq * 0.2 + luck * 0.15;
            break;
        case 'counter_def': // カウンター狙い
            baseValue = speed * 0.4 + iq * 0.3 + stamina * 0.15 + luck * 0.15;
            break;
        case 'reading':     // 読み勝負
            baseValue = iq * 0.5 + luck * 0.25 + technique * 0.15 + speed * 0.1;
            break;
    }
    
    const personalityBonus = getPersonalityBonus(player.personality, defenseTactic);
    
    return Math.min(100, baseValue * (1 + personalityBonus));
}
```

### チーム総合力の算出
```javascript
function calculateTeamPower(team, formation, attackTactic, defenseTactic) {
    let totalAttack = 0;
    let totalDefense = 0;
    
    // 各選手の戦術適性値を合計
    team.players.forEach(player => {
        const positionBonus = getPositionBonus(player.position, formation);
        
        const attackPower = calculateAttackPower(player, attackTactic);
        const defensePower = calculateDefensePower(player, defenseTactic);
        
        totalAttack += attackPower * positionBonus;
        totalDefense += defensePower * positionBonus;
    });
    
    // 指導者による補正
    const coachBonus = getCoachBonus(team.coach, attackTactic, defenseTactic);
    
    // フォーメーションによる補正
    const formationBonus = getFormationBonus(formation, attackTactic, defenseTactic);
    
    const finalAttack = totalAttack * coachBonus.attack * formationBonus.attack;
    const finalDefense = totalDefense * coachBonus.defense * formationBonus.defense;
    
    return {
        attack: Math.min(2000, finalAttack),    // 上限設定
        defense: Math.min(2000, finalDefense)   // 上限設定
    };
}
```

---

## ⚔️ Step 2: 戦力差の正規化

### 戦力差を0-100の範囲に変換
```javascript
function normalizeTeamPowers(teamA, teamB) {
    // 両チームの総合力を計算
    const totalA = (teamA.attack + teamA.defense) / 2;
    const totalB = (teamB.attack + teamB.defense) / 2;
    
    // 戦力差を計算（-1.0 ～ +1.0）
    const maxPower = 2000;
    const minPower = 800;
    const powerRange = maxPower - minPower;
    
    const normalizedA = Math.max(0, Math.min(100, (totalA - minPower) / powerRange * 100));
    const normalizedB = Math.max(0, Math.min(100, (totalB - minPower) / powerRange * 100));
    
    return {
        teamA: normalizedA,
        teamB: normalizedB,
        difference: normalizedA - normalizedB  // -100 ～ +100
    };
}
```

---

## 🎯 Step 3: 得点期待値の計算

### シグモイド関数で現実的な得点分布を生成
```javascript
function calculateExpectedGoals(teamPower, opponentDefense, powerDifference) {
    // 基本得点期待値（0.5 ～ 3.5の範囲）
    const baseProbability = 1.5; // 平均的な試合での得点期待値
    
    // 戦力差による補正（シグモイド関数使用）
    const sigmoid = (x) => 1 / (1 + Math.exp(-x / 20));
    const powerBonus = sigmoid(powerDifference) * 2; // 0 ～ 2の範囲
    
    // 相手守備力による減少
    const defenseReduction = Math.max(0.2, opponentDefense / 100);
    
    // 最終的な得点期待値
    const expectedGoals = (baseProbability + powerBonus) * defenseReduction;
    
    // 0.1 ～ 4.0の範囲に制限
    return Math.max(0.1, Math.min(4.0, expectedGoals));
}
```

### 実際の得点数を決定
```javascript
function generateActualGoals(expectedGoals, luck) {
    // ポアソン分布近似での得点生成
    const random1 = Math.random();
    const random2 = Math.random();
    const luckFactor = (luck / 100) * 0.3 + 0.85; // 0.85 ～ 1.15
    
    const adjustedExpected = expectedGoals * luckFactor;
    
    // ポアソン分布の簡易近似
    let goals = 0;
    let cumulative = Math.exp(-adjustedExpected);
    let sum = cumulative;
    
    while (random1 > sum) {
        goals++;
        cumulative *= adjustedExpected / goals;
        sum += cumulative;
        
        // 6点で強制終了（安全装置）
        if (goals >= 6) break;
    }
    
    return Math.min(6, goals);
}
```

---

## 🎲 Step 4: ランダム要素と特殊効果

### 運要素の統合
```javascript
function applyLuckEffects(baseGoals, teamLuck, coachLuck) {
    const totalLuck = (teamLuck + coachLuck) / 2;
    const luckVariance = (Math.random() - 0.5) * (totalLuck / 100) * 0.4;
    
    return Math.max(0, Math.min(6, baseGoals + luckVariance));
}
```

### 特技・弱点の発動
```javascript
function applySpecialEffects(goals, players, matchSituation) {
    let finalGoals = goals;
    
    players.forEach(player => {
        // 特技の発動判定
        if (player.skills.includes('ゴールハンター') && matchSituation === 'attack') {
            if (Math.random() < 0.15) { // 15%の確率
                finalGoals += 0.3;
                console.log(`${player.name}のゴールハンターが発動！`);
            }
        }
        
        // 弱点の発動判定
        if (player.weaknesses.includes('プレッシャー弱い') && matchSituation === 'important') {
            if (Math.random() < 0.12) { // 12%の確率
                finalGoals -= 0.2;
                console.log(`${player.name}のプレッシャー弱さが響いた...`);
            }
        }
    });
    
    return Math.max(0, Math.min(6, finalGoals));
}
```

---

## 🏆 Step 5: 最終試合結果の決定

### メイン計算関数
```javascript
function simulateMatch(teamA, teamB) {
    // Step 1: チーム戦力計算
    const powerA = calculateTeamPower(teamA, teamA.formation, teamA.attackTactic, teamA.defenseTactic);
    const powerB = calculateTeamPower(teamB, teamB.formation, teamB.attackTactic, teamB.defenseTactic);
    
    // Step 2: 戦力差の正規化
    const normalized = normalizeTeamPowers(powerA, powerB);
    
    // Step 3: 得点期待値計算
    const expectedA = calculateExpectedGoals(powerA.attack, powerB.defense, normalized.difference);
    const expectedB = calculateExpectedGoals(powerB.attack, powerA.defense, -normalized.difference);
    
    // Step 4: 実際の得点生成
    const teamLuckA = teamA.players.reduce((sum, p) => sum + p.abilities.luck, 0) / teamA.players.length;
    const teamLuckB = teamB.players.reduce((sum, p) => sum + p.abilities.luck, 0) / teamB.players.length;
    
    let goalsA = generateActualGoals(expectedA, teamLuckA);
    let goalsB = generateActualGoals(expectedB, teamLuckB);
    
    // Step 5: 運要素と特殊効果の適用
    goalsA = applyLuckEffects(goalsA, teamLuckA, teamA.coach.abilities.luck);
    goalsB = applyLuckEffects(goalsB, teamLuckB, teamB.coach.abilities.luck);
    
    goalsA = applySpecialEffects(goalsA, teamA.players, 'normal');
    goalsB = applySpecialEffects(goalsB, teamB.players, 'normal');
    
    // 最終調整（6-0制限の確実な実行）
    goalsA = Math.round(Math.max(0, Math.min(6, goalsA)));
    goalsB = Math.round(Math.max(0, Math.min(6, goalsB)));
    
    return {
        teamA: goalsA,
        teamB: goalsB,
        details: {
            expectedA: expectedA.toFixed(2),
            expectedB: expectedB.toFixed(2),
            powerDifference: normalized.difference.toFixed(1)
        }
    };
}
```

---

## 📈 補正値一覧

### 性格による戦術補正
```javascript
const personalityBonuses = {
    '努力家': { teamwork: 0.10, all: 0.05 },
    '天才肌': { individual: 0.15, possession: 0.10, teamwork: -0.05 },
    'クール': { reading: 0.10, pressing: 0.05, power: -0.05 },
    '熱血': { pressing: 0.15, power: 0.10, reading: -0.05 },
    'マイペース': { individual: 0.10, luckBonus: 0.20, teamwork: -0.10 },
    '冷静': { solid: 0.10, reading: 0.10, stability: 0.05 },
    '完璧主義': { possession: 0.15, teamwork: 0.10, pressure: -0.10 },
    '芸術家': { individual: 0.20, center: 0.10, practical: -0.05 },
    'バランス型': { all: 0.03 },
    '頑固': { solid: 0.15, power: 0.10, change: -0.10 },
    '単純': { counter: 0.15, pressing: 0.10, complex: -0.10 }
};
```

### 指導者による補正
```javascript
const coachBonuses = {
    'カリスマ性': (value) => ({ all: value / 100 * 0.15 }),
    '共感力': (value) => ({ growth: value / 100 * 0.30, morale: value / 100 * 0.20 }),
    '指導力': (value) => ({ tactics: value / 100 * 0.20, training: value / 100 * 0.25 }),
    '運': (value) => ({ luck: value / 100 * 0.15, clutch: value / 100 * 0.10 })
};
```

### フォーメーション補正
```javascript
const formationBonuses = {
    '4-3-3': { attack: 1.10, defense: 0.95 },
    '4-4-2': { attack: 1.00, defense: 1.00 },
    '5-4-1': { attack: 0.90, defense: 1.10 },
    '4-2-3-1': { attack: 1.05, defense: 1.00 },
    '3-5-2': { attack: 1.00, defense: 1.05 }
};
```

---

## 🎯 期待される結果分布

### 理想的なスコア分布
```
0-0: 10%     1-0: 18%    2-0: 12%    3-0: 6%     4-0: 2%     5-0: 0.5%   6-0: 0.2%
0-1: 18%     1-1: 15%    2-1: 15%    3-1: 8%     4-1: 2%     5-1: 0.3%
0-2: 12%     1-2: 15%    2-2: 8%     3-2: 4%     4-2: 1%
0-3: 6%      1-3: 8%     2-3: 4%     3-3: 1.5%
0-4: 2%      1-4: 2%     2-4: 1%
0-5: 0.5%    1-5: 0.3%
0-6: 0.2%
```

### バランスチェック
- **引き分け率**: 約25%（0-0, 1-1, 2-2, 3-3の合計）
- **1点差試合**: 約40%（リアルサッカーに近い）
- **大差試合（3点差以上）**: 約10%（妥当な範囲）
- **最大スコア**: 6-0で絶対制限

---

*「リアルなサッカーの興奮と、ゲームとしての面白さを両立する計算式」*