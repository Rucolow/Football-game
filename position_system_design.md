# ポジション別詳細設計

## 🎯 ポジション別能力値重み設定

### 基本設計思想
各ポジションの役割に応じて、6つの能力値の重要度を設定。合計100%になるよう調整。

```javascript
const positionWeights = {
  'GK': {
    speed: 0.05,      // 5% - 最小限のポジショニング
    power: 0.25,      // 25% - セービング、パンチング
    technique: 0.20,  // 20% - キック精度、ハンドリング
    stamina: 0.15,    // 15% - 90分集中力
    iq: 0.30,         // 30% - ポジショニング、判断力
    luck: 0.05        // 5% - ファインセーブ
  },
  'DF': {
    speed: 0.20,      // 20% - 相手FWについていく
    power: 0.25,      // 25% - 競り合い、クリア
    technique: 0.10,  // 10% - パス、トラップ
    stamina: 0.20,    // 20% - 90分走り続ける
    iq: 0.20,         // 20% - ポジショニング、読み
    luck: 0.05        // 5% - クリアランス
  },
  'MF': {
    speed: 0.15,      // 15% - ピッチを駆け回る
    power: 0.10,      // 10% - ボール奪取、シュート
    technique: 0.30,  // 30% - パス、ドリブル、トラップ
    stamina: 0.25,    // 25% - 最も運動量が多い
    iq: 0.15,         // 15% - 戦術理解、パス判断
    luck: 0.05        // 5% - こぼれ球
  },
  'FW': {
    speed: 0.25,      // 25% - 裏への抜け出し
    power: 0.20,      // 20% - シュート力、競り合い
    technique: 0.20,  // 20% - シュート技術、トラップ
    stamina: 0.10,    // 10% - 前線でのキープ
    iq: 0.15,         // 15% - ゴール嗅覚、ポジショニング
    luck: 0.10        // 10% - 決定機での運
  }
};
```

## 📊 ポジション適性計算システム

### 個別選手のポジション適性値計算
```javascript
function calculatePositionFitness(player, position) {
    const weights = positionWeights[position];
    const { speed, power, technique, stamina, iq, luck } = player.abilities;
    
    // 基本適性値計算
    const baseFitness = 
        speed * weights.speed +
        power * weights.power +
        technique * weights.technique +
        stamina * weights.stamina +
        iq * weights.iq +
        luck * weights.luck;
    
    // 年齢によるポジション補正
    const ageBonus = getAgePositionBonus(player.age, position);
    
    // 性格によるポジション補正
    const personalityBonus = getPersonalityPositionBonus(player.personality, position);
    
    // 最終適性値（1-100の範囲）
    const finalFitness = Math.min(100, Math.max(1, 
        baseFitness + ageBonus + personalityBonus
    ));
    
    return {
        base: Math.round(baseFitness),
        age: ageBonus,
        personality: personalityBonus,
        total: Math.round(finalFitness)
    };
}
```

### 年齢によるポジション補正
```javascript
function getAgePositionBonus(age, position) {
    const bonuses = {
        'GK': {
            // GKは経験が重要、長く現役可能
            range: [
                { min: 16, max: 22, bonus: -5 },   // 若すぎる
                { min: 23, max: 28, bonus: 0 },    // 適齢期
                { min: 29, max: 35, bonus: +5 },   // 経験重視
                { min: 36, max: 40, bonus: 0 }     // ベテラン
            ]
        },
        'DF': {
            // DFも経験重要だが、スピードも必要
            range: [
                { min: 16, max: 20, bonus: -3 },
                { min: 21, max: 30, bonus: +2 },
                { min: 31, max: 34, bonus: 0 },
                { min: 35, max: 40, bonus: -5 }
            ]
        },
        'MF': {
            // MFは体力と技術のバランス
            range: [
                { min: 16, max: 19, bonus: -2 },
                { min: 20, max: 28, bonus: +3 },
                { min: 29, max: 32, bonus: 0 },
                { min: 33, max: 40, bonus: -5 }
            ]
        },
        'FW': {
            // FWはスピードが重要、若い方が有利
            range: [
                { min: 16, max: 18, bonus: -3 },
                { min: 19, max: 27, bonus: +5 },
                { min: 28, max: 30, bonus: 0 },
                { min: 31, max: 40, bonus: -8 }
            ]
        }
    };
    
    const positionBonus = bonuses[position].range.find(
        r => age >= r.min && age <= r.max
    );
    
    return positionBonus ? positionBonus.bonus : 0;
}
```

### 性格によるポジション補正
```javascript
function getPersonalityPositionBonus(personality, position) {
    const bonuses = {
        'GK': {
            '冷静': +8,        // 冷静な判断が重要
            '完璧主義': +5,    // ミスが許されない
            '頑固': +3,        // 守備の信念
            '努力家': +3,
            '熱血': -3,        // 感情的になりがち
            'マイペース': -5   // チームとの連携
        },
        'DF': {
            '頑固': +8,        // 守備の信念
            '冷静': +5,        // 冷静な守備判断
            '努力家': +5,      // 献身的な守備
            '完璧主義': +3,
            '天才肌': -3,      // 個人技より組織
            'マイペース': -5   // 守備は連携重要
        },
        'MF': {
            'バランス型': +8,  // 攻守のバランス
            '努力家': +5,      // 運動量でカバー
            '完璧主義': +5,    // 正確なパス
            '冷静': +3,
            '単純': -5,        // 複雑な役割理解困難
            '芸術家': -3       // 実用性より美しさ
        },
        'FW': {
            '天才肌': +8,      // 個人技で突破
            '熱血': +5,        // ゴールへの執念
            'マイペース': +3,  // 自由な発想
            '芸術家': +3,      // 創造性
            '頑固': -3,        // 柔軟性不足
            '完璧主義': -5     // リスクを取れない
        }
    };
    
    return bonuses[position][personality] || 0;
}
```

## 🔄 複数ポジション対応システム

### 複数ポジション選手の処理
```javascript
function calculateMultiPositionPlayer(player) {
    const positions = player.positions; // ['MF', 'DF']
    const fitness = {};
    
    positions.forEach(position => {
        fitness[position] = calculatePositionFitness(player, position);
    });
    
    // メインポジションは最も適性の高いポジション
    const mainPosition = Object.keys(fitness).reduce((a, b) => 
        fitness[a].total > fitness[b].total ? a : b
    );
    
    return {
        positions: positions,
        fitness: fitness,
        mainPosition: mainPosition,
        versatility: positions.length > 1 ? 10 : 0 // 複数ポジション対応ボーナス
    };
}
```

### フォーメーションでのポジション配置
```javascript
function assignPlayersToFormation(team, formation) {
    const formationData = formations[formation];
    const assignments = {};
    
    // ポジション別必要人数
    const requirements = {
        'GK': 1,
        'DF': formationData.defenders,
        'MF': formationData.midfielders,
        'FW': formationData.forwards
    };
    
    // 各ポジションに最適な選手を配置
    Object.keys(requirements).forEach(position => {
        const needed = requirements[position];
        
        // そのポジションが可能な選手をリストアップ
        const candidates = team.players.filter(player => 
            player.positions.includes(position) && !assignments[player.id]
        );
        
        // 適性値でソートして上位を選択
        candidates.sort((a, b) => {
            const fitnessA = calculatePositionFitness(a, position).total;
            const fitnessB = calculatePositionFitness(b, position).total;
            return fitnessB - fitnessA;
        });
        
        // 必要人数分を配置
        for (let i = 0; i < Math.min(needed, candidates.length); i++) {
            assignments[candidates[i].id] = {
                position: position,
                fitness: calculatePositionFitness(candidates[i], position).total
            };
        }
    });
    
    return assignments;
}
```

## 📈 ポジション別成長システム

### ポジション特化成長
```javascript
function applyPositionSpecificGrowth(player, months = 1) {
    const mainPosition = player.mainPosition;
    const weights = positionWeights[mainPosition];
    
    // ポジションに重要な能力値ほど成長しやすい
    const growthMultipliers = {
        speed: 1 + (weights.speed * 2),
        power: 1 + (weights.power * 2),
        technique: 1 + (weights.technique * 2),
        stamina: 1 + (weights.stamina * 2),
        iq: 1 + (weights.iq * 2),
        luck: 1 + (weights.luck * 2)
    };
    
    // 基本成長に乗算
    Object.keys(player.abilities).forEach(ability => {
        const baseGrowth = calculateBasicGrowth(player, ability, months);
        const positionGrowth = baseGrowth * growthMultipliers[ability];
        player.abilities[ability] += positionGrowth;
    });
}
```

## 🎯 ポジション別戦術効果

### 戦術におけるポジション重要度
```javascript
const tacticPositionWeights = {
    'counter': {
        // 速攻ではFWとMFのスピードが重要
        'GK': 0.05, 'DF': 0.15, 'MF': 0.40, 'FW': 0.40
    },
    'possession': {
        // ポゼッションではMFの技術が最重要
        'GK': 0.10, 'DF': 0.20, 'MF': 0.50, 'FW': 0.20
    },
    'side': {
        // サイド攻撃ではサイドのDFとMFが重要
        'GK': 0.05, 'DF': 0.35, 'MF': 0.35, 'FW': 0.25
    },
    'center': {
        // 中央突破ではMFとFWが重要
        'GK': 0.05, 'DF': 0.15, 'MF': 0.40, 'FW': 0.40
    },
    'power': {
        // パワープレーでは全ポジションのパワーが重要
        'GK': 0.10, 'DF': 0.30, 'MF': 0.30, 'FW': 0.30
    },
    'individual': {
        // 個人技ではFWが最重要
        'GK': 0.05, 'DF': 0.10, 'MF': 0.25, 'FW': 0.60
    }
};
```

## 🔢 実際の計算例

### 例：清水遼（FW）のポジション適性
```javascript
// 清水遼の能力値
const shimizu = {
    abilities: { speed: 95, power: 88, technique: 92, stamina: 78, iq: 85, luck: 75 },
    age: 24,
    personality: '天才肌',
    positions: ['FW']
};

// FWとしての適性計算
const fwFitness = calculatePositionFitness(shimizu, 'FW');
// 結果: 95*0.25 + 88*0.20 + 92*0.20 + 78*0.10 + 85*0.15 + 75*0.10
//      = 23.75 + 17.6 + 18.4 + 7.8 + 12.75 + 7.5 = 87.8
// 年齢ボーナス: +5 (24歳のFW黄金期)
// 性格ボーナス: +8 (天才肌のFW)
// 最終適性: 87.8 + 5 + 8 = 100.8 → 100 (上限)

// MFとしての適性計算（仮に）
const mfFitness = calculatePositionFitness(shimizu, 'MF');
// 結果: 95*0.15 + 88*0.10 + 92*0.30 + 78*0.25 + 85*0.15 + 75*0.05
//      = 14.25 + 8.8 + 27.6 + 19.5 + 12.75 + 3.75 = 86.65
// 年齢ボーナス: +3
// 性格ボーナス: -3 (天才肌のMF)
// 最終適性: 86.65 + 3 - 3 = 86.65 → 87

// 清水遼はFW適性100、MF適性87 → FW専門が最適
```

## 🎮 UI表示での活用

### 選手詳細画面での表示
```
⚡ 清水 遼 (24歳・FW)
💰 6億KR

📊 ポジション適性
🥅 GK: 45 ⚫⚫⚫⚪⚪
🛡️ DF: 62 ⚫⚫⚫⚪⚪  
⚙️ MF: 87 ⚫⚫⚫⚫⚪
⚡ FW: 100 ⚫⚫⚫⚫⚫ ✨

最適ポジション: FW
```

---

*「各ポジションの特性を活かした、リアルで戦略的なシステム」*