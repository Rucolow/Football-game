# サッカーゲーム 選手成長・怪我システム

## 🌱 基本設計思想

### 📈 **成長・衰退の基本方針**
- **16-22歳**: 急成長期、大幅な能力向上
- **23-27歳**: 安定期、緩やかな成長
- **28-32歳**: 維持期、現状維持がメイン
- **33歳以上**: 衰退期、能力低下開始

### ⚽ **リアルサッカー選手のキャリア**
```
16-19歳: 才能開花、急激な成長
20-24歳: 成長継続、レギュラー定着
25-29歳: 全盛期、安定したパフォーマンス
30-34歳: 経験でカバー、徐々に衰退
35歳以上: 引退を視野、大幅な能力低下
```

---

## 📊 Step 1: 年齢による基本成長率

### 年齢別成長・衰退係数
```javascript
function getAgeGrowthRate(age) {
    if (age <= 16) return 0.15;      // +15% (超高成長)
    if (age <= 18) return 0.12;      // +12% (高成長)
    if (age <= 20) return 0.10;      // +10% (高成長)
    if (age <= 22) return 0.08;      // +8%  (中成長)
    if (age <= 25) return 0.05;      // +5%  (低成長)
    if (age <= 27) return 0.02;      // +2%  (微成長)
    if (age <= 30) return 0.00;      // ±0%  (維持)
    if (age <= 32) return -0.02;     // -2%  (微衰退)
    if (age <= 34) return -0.05;     // -5%  (衰退)
    if (age <= 36) return -0.08;     // -8%  (大衰退)
    return -0.12;                    // -12% (急激衰退)
}
```

### 年齢による怪我確率
```javascript
function getInjuryRate(age) {
    if (age <= 20) return 0.03;      // 3%  (若い体)
    if (age <= 25) return 0.05;      // 5%  (標準)
    if (age <= 30) return 0.08;      // 8%  (やや高)
    if (age <= 32) return 0.12;      // 12% (高)
    if (age <= 34) return 0.18;      // 18% (とても高)
    return 0.25;                     // 25% (非常に高)
}
```

---

## 🎯 Step 2: 合宿での成長計算

### 基本成長量の計算
```javascript
function calculateTrainingGrowth(player, coach) {
    const ageRate = getAgeGrowthRate(player.age);
    const coachEffect = getCoachTrainingEffect(coach, player);
    const personalityBonus = getPersonalityGrowthBonus(player.personality);
    
    // 基本成長量（各能力値に対して）
    const baseGrowth = {
        speed: Math.random() * 3 + 1,      // 1-4ポイント
        power: Math.random() * 3 + 1,      // 1-4ポイント  
        technique: Math.random() * 3 + 1,  // 1-4ポイント
        stamina: Math.random() * 3 + 1,    // 1-4ポイント
        iq: Math.random() * 3 + 1,         // 1-4ポイント
        luck: Math.random() * 2 + 0.5      // 0.5-2.5ポイント（運は成長しにくい）
    };
    
    // 年齢・指導者・性格補正を適用
    const finalGrowth = {};
    Object.keys(baseGrowth).forEach(ability => {
        finalGrowth[ability] = baseGrowth[ability] * 
                              (1 + ageRate) * 
                              (1 + coachEffect) * 
                              (1 + personalityBonus);
        
        // 成長は最大+8ポイント、衰退は最大-6ポイントに制限
        finalGrowth[ability] = Math.max(-6, Math.min(8, finalGrowth[ability]));
    });
    
    return finalGrowth;
}
```

### 指導者の成長効果
```javascript
function getCoachTrainingEffect(coach, player) {
    const { charisma, empathy, coaching, luck } = coach.abilities;
    
    // 基本指導効果
    let baseEffect = coaching / 100 * 0.3; // 最大+30%
    
    // 年齢別指導効果
    if (player.age <= 23) {
        baseEffect += empathy / 100 * 0.2; // 若手には共感力が重要
    } else {
        baseEffect += charisma / 100 * 0.15; // ベテランにはカリスマ性
    }
    
    // 性格相性ボーナス
    const compatibilityBonus = getCoachPlayerCompatibility(coach, player);
    
    return Math.min(0.5, baseEffect + compatibilityBonus); // 最大+50%
}
```

### 性格による成長ボーナス
```javascript
function getPersonalityGrowthBonus(personality) {
    const bonuses = {
        '努力家': 0.25,        // +25% (最も成長しやすい)
        '天才肌': 0.15,        // +15% (才能で成長)
        '完璧主義': 0.20,      // +20% (コツコツ成長)
        '熱血': 0.10,          // +10% (気持ちで成長)
        '冷静': 0.08,          // +8%  (計画的成長)
        'バランス型': 0.05,    // +5%  (平均的)
        'マイペース': 0.00,    // ±0%  (ムラがある)
        '芸術家': -0.05,       // -5%  (基本軽視)
        '頑固': -0.10,         // -10% (変化を嫌う)
        '単純': -0.15          // -15% (考えが浅い)
    };
    
    return bonuses[personality] || 0;
}
```

---

## ✨ Step 3: 覚醒システム

### 覚醒確率の計算
```javascript
function calculateAwakeningProbability(player, coach) {
    // 基本覚醒確率
    let baseProbability = 0.05; // 5%
    
    // 年齢による補正（若いほど覚醒しやすい）
    const ageBonus = Math.max(0, (25 - player.age) * 0.01); // 16歳=9%, 25歳=0%
    
    // 運による補正
    const luckBonus = (player.abilities.luck / 100) * 0.1; // 最大+10%
    
    // 指導者の運による補正
    const coachLuckBonus = (coach.abilities.luck / 100) * 0.05; // 最大+5%
    
    // 性格による補正
    const personalityBonus = {
        '天才肌': 0.08,        // +8%
        '努力家': 0.05,        // +5%
        'マイペース': 0.03,    // +3%
        '熱血': 0.02,          // +2%
        '完璧主義': -0.02,     // -2% (覚醒を認めたがらない)
        '頑固': -0.05          // -5% (変化を嫌う)
    }[player.personality] || 0;
    
    const finalProbability = baseProbability + ageBonus + luckBonus + 
                           coachLuckBonus + personalityBonus;
    
    return Math.max(0.01, Math.min(0.25, finalProbability)); // 1-25%の範囲
}
```

### 覚醒効果の計算
```javascript
function calculateAwakeningEffect(player) {
    const ageMultiplier = player.age <= 20 ? 1.5 : 
                         player.age <= 25 ? 1.2 : 
                         player.age <= 30 ? 1.0 : 0.8;
    
    // 覚醒による能力上昇（大幅な成長）
    const awakeningGrowth = {
        speed: (Math.random() * 8 + 5) * ageMultiplier,      // 5-13ポイント
        power: (Math.random() * 8 + 5) * ageMultiplier,      // 5-13ポイント
        technique: (Math.random() * 8 + 5) * ageMultiplier,  // 5-13ポイント
        stamina: (Math.random() * 8 + 5) * ageMultiplier,    // 5-13ポイント
        iq: (Math.random() * 8 + 5) * ageMultiplier,         // 5-13ポイント
        luck: (Math.random() * 5 + 3) * ageMultiplier        // 3-8ポイント
    };
    
    // 特技の追加や弱点の軽減も発生
    const specialEffects = generateAwakeningSpecialEffects(player);
    
    return {
        abilities: awakeningGrowth,
        specialEffects: specialEffects
    };
}
```

---

## 🚑 Step 4: 怪我システム

### 怪我確率の判定
```javascript
function checkInjury(player, matchStress = 1.0) {
    const baseInjuryRate = getInjuryRate(player.age);
    
    // 弱点による怪我確率上昇
    const weaknessMultiplier = player.weaknesses.includes('怪我しやすい') ? 2.0 : 1.0;
    
    // 試合のハードさによる補正
    const stressMultiplier = matchStress; // 1.0=通常, 1.5=激戦
    
    // スタミナによる補正（スタミナが低いと怪我しやすい）
    const staminaMultiplier = Math.max(0.5, (100 - player.abilities.stamina) / 100 + 0.5);
    
    const finalInjuryRate = baseInjuryRate * weaknessMultiplier * 
                           stressMultiplier * staminaMultiplier;
    
    return Math.random() < finalInjuryRate;
}
```

### 怪我の程度と影響（改訂版）
```javascript
function calculateInjuryEffect(player) {
    // 怪我の重度をランダムで決定
    const severityRoll = Math.random();
    let severity;
    
    if (severityRoll < 0.6) {
        severity = 'light';      // 軽傷 (60%)
    } else if (severityRoll < 0.85) {
        severity = 'moderate';   // 中傷 (25%)
    } else {
        severity = 'severe';     // 重傷 (15%)
    }
    
    // 重度別の能力低下と出場停止
    const injuryData = {
        'light': {
            matchesBanned: 1,                      // 1試合出場停止
            abilityDecline: {
                speed: -(Math.random() * 3 + 1),      // -1～-4
                power: -(Math.random() * 2 + 1),      // -1～-3
                technique: -(Math.random() * 1 + 0.5), // -0.5～-1.5
                stamina: -(Math.random() * 4 + 2),     // -2～-6
                iq: 0,                                 // 影響なし
                luck: -(Math.random() * 2 + 1)         // -1～-3
            }
        },
        'moderate': {
            matchesBanned: 3,                      // 3試合出場停止
            abilityDecline: {
                speed: -(Math.random() * 6 + 3),      // -3～-9
                power: -(Math.random() * 4 + 2),      // -2～-6
                technique: -(Math.random() * 2 + 1),   // -1～-3
                stamina: -(Math.random() * 8 + 4),     // -4～-12
                iq: -(Math.random() * 1 + 0.5),       // -0.5～-1.5
                luck: -(Math.random() * 4 + 2)        // -2～-6
            }
        },
        'severe': {
            matchesBanned: 5,                      // 5試合出場停止
            abilityDecline: {
                speed: -(Math.random() * 10 + 8),     // -8～-18
                power: -(Math.random() * 8 + 6),      // -6～-14
                technique: -(Math.random() * 4 + 3),   // -3～-7
                stamina: -(Math.random() * 15 + 10),   // -10～-25
                iq: -(Math.random() * 3 + 2),         // -2～-5
                luck: -(Math.random() * 8 + 5)        // -5～-13
            }
        }
    };
    
    return {
        severity: severity,
        matchesBanned: injuryData[severity].matchesBanned,
        abilityDecline: injuryData[severity].abilityDecline,
        isActive: false  // 怪我中は出場不可
    };
}
```

### 自動選手交代システム
```javascript
function handleInjuredPlayer(team, injuredPlayer, formation) {
    // 怪我した選手を控えと交代
    const position = injuredPlayer.currentPosition;
    const availableSubstitutes = team.players.filter(player => 
        player.positions.includes(position) && 
        !player.isInjured && 
        !player.isInStarting11
    );
    
    if (availableSubstitutes.length > 0) {
        // 最も適性の高い控え選手を選択
        const bestSubstitute = availableSubstitutes.reduce((best, current) => {
            const bestFitness = calculatePositionFitness(best, position).total;
            const currentFitness = calculatePositionFitness(current, position).total;
            return currentFitness > bestFitness ? current : best;
        });
        
        // 選手交代実行
        team.startingLineup[position] = bestSubstitute;
        injuredPlayer.isInStarting11 = false;
        bestSubstitute.isInStarting11 = true;
        
        return {
            out: injuredPlayer.name,
            in: bestSubstitute.name,
            position: position,
            fitnessLoss: calculatePositionFitness(bestSubstitute, position).total - 
                        calculatePositionFitness(injuredPlayer, position).total
        };
    } else {
        // 控えがいない場合は戦力大幅ダウン
        return {
            out: injuredPlayer.name,
            in: null,
            position: position,
            fitnessLoss: -50  // 大幅な戦力低下
        };
    }
}
```

### 怪我からの復帰処理
```javascript
function processInjuryRecovery(team) {
    const recoveredPlayers = [];
    
    team.players.forEach(player => {
        if (player.isInjured && player.injuryData) {
            player.injuryData.matchesBanned--;
            
            if (player.injuryData.matchesBanned <= 0) {
                // 復帰処理
                player.isInjured = false;
                player.isActive = true;
                
                // 能力値の低下は永続的（回復しない）
                recoveredPlayers.push({
                    name: player.name,
                    severity: player.injuryData.severity,
                    permanentLoss: player.injuryData.abilityDecline
                });
                
                delete player.injuryData;
            }
        }
    });
    
    return recoveredPlayers;
}
```

---

## 🔄 Step 5: 月次成長処理

### メイン成長処理関数
```javascript
function processMonthlyGrowth(team) {
    const results = {
        growth: [],
        awakenings: [],
        injuries: [],
        retirements: []
    };
    
    team.players.forEach(player => {
        // 1. 基本成長/衰退の処理
        const trainingGrowth = calculateTrainingGrowth(player, team.coach);
        applyAbilityChanges(player, trainingGrowth);
        
        if (isSignificantGrowth(trainingGrowth)) {
            results.growth.push({
                player: player.name,
                changes: trainingGrowth
            });
        }
        
        // 2. 覚醒判定
        const awakeningProb = calculateAwakeningProbability(player, team.coach);
        if (Math.random() < awakeningProb) {
            const awakeningEffect = calculateAwakeningEffect(player);
            applyAbilityChanges(player, awakeningEffect.abilities);
            applySpecialEffects(player, awakeningEffect.specialEffects);
            
            results.awakenings.push({
                player: player.name,
                effect: awakeningEffect
            });
        }
        
        // 3. 怪我判定
        if (checkInjury(player)) {
            const injuryEffect = calculateInjuryEffect(player);
            applyAbilityChanges(player, injuryEffect.abilityDecline);
            player.injuryWeeks = injuryEffect.recoveryWeeks;
            
            results.injuries.push({
                player: player.name,
                severity: injuryEffect.severity,
                weeks: injuryEffect.recoveryWeeks
            });
        }
        
        // 4. 引退判定（高齢選手）
        if (player.age >= 36 && checkRetirement(player)) {
            results.retirements.push({
                player: player.name,
                age: player.age,
                reason: 'age'
            });
        }
        
        // 5. 年齢を1ヶ月分増加
        player.age += 1/12;
    });
    
    return results;
}
```

### 能力値の適用と制限
```javascript
function applyAbilityChanges(player, changes) {
    Object.keys(changes).forEach(ability => {
        if (player.abilities[ability] !== undefined) {
            player.abilities[ability] += changes[ability];
            
            // 能力値を1-100の範囲に制限
            player.abilities[ability] = Math.max(1, Math.min(100, player.abilities[ability]));
        }
    });
}
```

---

## 📊 期待される成長パターン

### 年齢別の典型的なキャリア
```javascript
// 18歳の有望株 (原田光) の4年間の予想成長
const careerExample = {
    age18: { total: 360, growth: '+15-20/年', injury: '3%', awakening: '12%' },
    age22: { total: 420, growth: '+8-12/年', injury: '5%', awakening: '8%' },
    age26: { total: 450, growth: '+2-5/年', injury: '8%', awakening: '4%' },
    age30: { total: 455, growth: '±0/年', injury: '12%', awakening: '2%' },
    age34: { total: 430, growth: '-5-8/年', injury: '18%', awakening: '1%' }
};
```

### 覚醒による劇的変化
```javascript
// 覚醒前後の能力値例
const awakeningExample = {
    before: { speed: 70, power: 65, technique: 75, stamina: 68, iq: 72, luck: 80 },
    after:  { speed: 83, power: 78, technique: 87, stamina: 81, iq: 85, luck: 88 },
    change: { speed: +13, power: +13, technique: +12, stamina: +13, iq: +13, luck: +8 }
};
```

### 怪我による能力低下
```javascript
// 重傷例：30歳ベテランの場合
const severeInjuryExample = {
    before: { speed: 65, power: 80, technique: 85, stamina: 70, iq: 88, luck: 72 },
    after:  { speed: 50, power: 66, technique: 79, stamina: 45, iq: 83, luck: 60 },
    change: { speed: -15, power: -14, technique: -6, stamina: -25, iq: -5, luck: -12 }
};
```

---

## 🎮 ゲーム体験への効果

### 📈 **長期戦略の重要性**
- 若手投資の価値を実感
- ベテランのリスク管理
- 世代交代のタイミング

### 🎭 **ドラマチックな展開**
- 無名の若手が突然覚醒
- エースの怪我でチーム戦力ダウン
- ベテランの最後の輝き

### 🧠 **戦略的思考の促進**
- 年齢構成の重要性
- 指導者選択の長期的影響
- リスク分散の必要性

---

*「選手一人ひとりの人生が、チームの運命を左右する」*