/* ========================================
   成長エンジン - 選手の成長とイベント管理
======================================== */

class GrowthEngine {
  constructor() {
    this.version = '1.0.0';
    this.random = random;
    this.debug = DEBUG;
  }
  
  // 月次成長処理
  processMonthlyGrowth(team, coach = null) {
    try {
      log.info('Processing monthly growth for team');
      
      const growthResults = {
        playerGrowth: [],
        awakenings: [],
        injuries: [],
        retirements: [],
        summary: {}
      };
      
      team.players.forEach(player => {
        const result = this.processPlayerGrowth(player, coach, team);
        
        if (result.abilityChange > 0) {
          growthResults.playerGrowth.push(result);
        }
        
        if (result.awakening) {
          growthResults.awakenings.push(result);
        }
        
        if (result.injury) {
          growthResults.injuries.push(result);
        }
        
        if (result.retirement) {
          growthResults.retirements.push(result);
        }
      });
      
      // 統計作成
      growthResults.summary = this.createGrowthSummary(growthResults);
      
      log.info(`Growth processed: ${growthResults.playerGrowth.length} players improved`);
      return growthResults;
      
    } catch (error) {
      log.error('Monthly growth processing failed', error);
      return {
        playerGrowth: [],
        awakenings: [],
        injuries: [],
        retirements: [],
        summary: { error: true }
      };
    }
  }
  
  // 個別選手成長処理
  processPlayerGrowth(player, coach, team) {
    const result = {
      player: player,
      oldAbilities: [...player.abilities],
      newAbilities: [...player.abilities],
      abilityChange: 0,
      awakening: false,
      injury: false,
      retirement: false,
      events: []
    };
    
    // 年齢による成長・衰退
    this.applyAgeEffects(player, result);
    
    // 基本成長処理
    this.applyBasicGrowth(player, coach, result);
    
    // 覚醒チェック
    this.checkAwakening(player, coach, result);
    
    // 怪我チェック
    this.checkInjury(player, coach, result);
    
    // 引退チェック
    this.checkRetirement(player, result);
    
    // 調子・モラール調整
    this.adjustCondition(player, result);
    
    // 結果適用
    this.applyGrowthResult(player, result);
    
    return result;
  }
  
  // 年齢効果適用
  applyAgeEffects(player, result) {
    player.age += 1/12; // 月次なので1/12歳加算
    
    // 年齢による影響
    const ageEffect = PlayerUtils.getAgeGrowthRate(Math.floor(player.age));
    
    if (ageEffect < 1.0 && Math.floor(player.age) >= 30) {
      // 30歳以上は能力低下の可能性
      const declineChance = (Math.floor(player.age) - 30) * 5; // 30歳で5%、35歳で25%
      
      if (this.random.int(1, 100) <= declineChance) {
        const abilityIndex = this.random.int(0, 5);
        const decline = this.random.int(1, 2);
        
        result.newAbilities[abilityIndex] = Math.max(30, result.newAbilities[abilityIndex] - decline);
        result.abilityChange -= decline;
        result.events.push(`年齢による能力低下: ${this.getAbilityName(abilityIndex)} -${decline}`);
      }
    }
  }
  
  // 基本成長処理
  applyBasicGrowth(player, coach, result) {
    const baseGrowthChance = this.calculateGrowthChance(player, coach);
    
    if (this.random.int(1, 100) <= baseGrowthChance) {
      // 成長する能力を選択
      const growthAbilities = this.selectGrowthAbilities(player);
      
      growthAbilities.forEach(abilityIndex => {
        const growthAmount = this.calculateGrowthAmount(player, coach, abilityIndex);
        
        if (growthAmount > 0) {
          result.newAbilities[abilityIndex] = Math.min(99, result.newAbilities[abilityIndex] + growthAmount);
          result.abilityChange += growthAmount;
          result.events.push(`成長: ${this.getAbilityName(abilityIndex)} +${growthAmount}`);
        }
      });
    }
  }
  
  // 成長確率計算
  calculateGrowthChance(player, coach) {
    let baseChance = 30; // 基本30%
    
    // 年齢による影響
    const ageRate = PlayerUtils.getAgeGrowthRate(Math.floor(player.age));
    baseChance *= ageRate;
    
    // ポテンシャルによる影響
    baseChance += (player.growthPotential - 60) * 0.5;
    
    // 性格による影響
    const personalityEffect = PERSONALITIES[player.personality];
    if (personalityEffect) {
      baseChance *= personalityEffect.growthRate;
    }
    
    // 監督による影響
    if (coach && coach.growthBonus) {
      baseChance *= coach.growthBonus;
    }
    
    // 調子・モラールによる影響
    const conditionBonus = (player.form + player.morale - 200) * 0.1;
    baseChance += conditionBonus;
    
    return Math.max(5, Math.min(80, Math.round(baseChance)));
  }
  
  // 成長する能力選択
  selectGrowthAbilities(player) {
    const abilities = [];
    const numGrowth = this.random.int(1, 3); // 1-3個の能力が成長
    
    for (let i = 0; i < numGrowth; i++) {
      let abilityIndex;
      
      // ポジションに関連した能力が成長しやすい
      switch (player.position) {
        case 'GK':
          abilityIndex = this.random.choice([2, 4, 5]); // テクニック、IQ、運
          break;
        case 'DF':
          abilityIndex = this.random.choice([1, 3, 4]); // パワー、スタミナ、IQ
          break;
        case 'MF':
          abilityIndex = this.random.choice([0, 2, 3, 4]); // スピード、テクニック、スタミナ、IQ
          break;
        case 'FW':
          abilityIndex = this.random.choice([0, 1, 2]); // スピード、パワー、テクニック
          break;
        default:
          abilityIndex = this.random.int(0, 5);
      }
      
      if (!abilities.includes(abilityIndex)) {
        abilities.push(abilityIndex);
      }
    }
    
    return abilities;
  }
  
  // 成長量計算
  calculateGrowthAmount(player, coach, abilityIndex) {
    let baseGrowth = 1;
    
    // 年齢による影響
    const ageRate = PlayerUtils.getAgeGrowthRate(Math.floor(player.age));
    if (ageRate > 1.0) {
      baseGrowth += this.random.int(0, 1); // 若い選手は追加成長の可能性
    }
    
    // ポテンシャルによる影響
    if (player.growthPotential > 80) {
      if (this.random.int(1, 100) <= 20) {
        baseGrowth += 1; // ハイポテンシャル選手は大きく成長する可能性
      }
    }
    
    // 現在能力値による制限
    const currentAbility = player.abilities[abilityIndex];
    if (currentAbility >= 90) {
      if (this.random.int(1, 100) > 20) {
        return 0; // 高能力値は成長しにくい
      }
    }
    
    return Math.min(3, baseGrowth); // 最大3まで
  }
  
  // 覚醒チェック
  checkAwakening(player, coach, result) {
    const awakeningChance = PlayerUtils.calculateAwakeningChance(player, coach);
    
    if (this.random.int(1, 100) <= awakeningChance) {
      result.awakening = true;
      
      // 覚醒タイプ決定
      const awakeningType = this.selectAwakeningType(player);
      
      // 覚醒効果適用
      this.applyAwakeningEffect(player, awakeningType, result);
      
      result.events.push(`覚醒発生: ${awakeningType.name}`);
      log.info(`Player awakening: ${player.name} - ${awakeningType.name}`);
    }
  }
  
  // 覚醒タイプ選択
  selectAwakeningType(player) {
    const awakeningTypes = [
      {
        name: '能力大幅向上',
        effect: 'ability_boost',
        rarity: 'common'
      },
      {
        name: '特殊能力習得',
        effect: 'skill_acquisition',
        rarity: 'rare'
      },
      {
        name: 'ポテンシャル開花',
        effect: 'potential_unlock',
        rarity: 'rare'
      },
      {
        name: '成長率向上',
        effect: 'growth_boost',
        rarity: 'common'
      },
      {
        name: '怪我耐性向上',
        effect: 'injury_resistance',
        rarity: 'common'
      }
    ];
    
    // 性格や年齢に基づいて確率調整
    const availableTypes = awakeningTypes.filter(type => {
      if (type.rarity === 'rare' && this.random.int(1, 100) > 30) {
        return false;
      }
      return true;
    });
    
    return this.random.choice(availableTypes);
  }
  
  // 覚醒効果適用
  applyAwakeningEffect(player, awakeningType, result) {
    switch (awakeningType.effect) {
      case 'ability_boost':
        // 全能力値に+2-4のボーナス
        for (let i = 0; i < 6; i++) {
          const boost = this.random.int(2, 4);
          result.newAbilities[i] = Math.min(99, result.newAbilities[i] + boost);
          result.abilityChange += boost;
        }
        break;
        
      case 'skill_acquisition':
        // 新しい特殊能力を習得
        const newSkill = this.generateSpecialSkill(player.position);
        if (!player.specialSkills.includes(newSkill)) {
          player.specialSkills.push(newSkill);
        }
        break;
        
      case 'potential_unlock':
        // ポテンシャル値向上
        player.growthPotential = Math.min(99, player.growthPotential + this.random.int(5, 10));
        break;
        
      case 'growth_boost':
        // 成長率一時的向上（次回成長時まで）
        player.awakeningBonus = 1.5;
        break;
        
      case 'injury_resistance':
        // 怪我しにくくなる
        player.injuryResistance = (player.injuryResistance || 1.0) * 0.7;
        break;
    }
  }
  
  // 特殊能力生成
  generateSpecialSkill(position) {
    const skillsByPosition = {
      GK: ['神セーブ', 'パンチング', 'キック精度', '冷静さ'],
      DF: ['完璧マーク', '空中戦', '危険察知', 'タックル'],
      MF: ['パス王', '運動量', '試合読み', 'ロングシュート'],
      FW: ['得点感覚', '裏抜け', 'ヘディング', 'ドリブル']
    };
    
    const skills = skillsByPosition[position] || skillsByPosition.MF;
    return this.random.choice(skills);
  }
  
  // 怪我チェック
  checkInjury(player, coach, result) {
    if (player.injured) return; // 既に怪我中
    
    const injuryRisk = PlayerUtils.calculateInjuryRisk(player, coach);
    const adjustedRisk = injuryRisk * (player.injuryResistance || 1.0);
    
    if (this.random.int(1, 100) <= adjustedRisk) {
      result.injury = true;
      
      // 怪我の種類と期間決定
      const injuryData = this.generateInjury(player);
      
      player.injured = true;
      player.injuryDays = injuryData.days;
      player.injuryType = injuryData.type;
      
      result.events.push(`怪我: ${injuryData.type} (${injuryData.days}日間)`);
      log.info(`Player injured: ${player.name} - ${injuryData.type}`);
    }
  }
  
  // 怪我生成
  generateInjury(player) {
    const injuries = [
      { type: '軽傷', days: this.random.int(7, 14), severity: 'minor' },
      { type: '筋肉痛', days: this.random.int(3, 7), severity: 'minor' },
      { type: '捻挫', days: this.random.int(14, 21), severity: 'moderate' },
      { type: '打撲', days: this.random.int(7, 14), severity: 'moderate' },
      { type: '肉離れ', days: this.random.int(21, 35), severity: 'severe' },
      { type: '骨折', days: this.random.int(60, 90), severity: 'severe' }
    ];
    
    // 年齢と体力によって重傷確率調整
    let availableInjuries = [...injuries];
    
    if (player.age < 25 && this.random.int(1, 100) <= 70) {
      // 若い選手は軽傷が多い
      availableInjuries = injuries.filter(inj => inj.severity !== 'severe');
    } else if (player.age >= 30) {
      // 年配選手は重傷リスク高
      if (this.random.int(1, 100) <= 30) {
        availableInjuries = injuries.filter(inj => inj.severity === 'severe');
      }
    }
    
    return this.random.choice(availableInjuries);
  }
  
  // 引退チェック
  checkRetirement(player, result) {
    if (player.age < 32) return; // 32歳未満は引退しない
    
    let retirementChance = 0;
    
    // 年齢による引退確率
    if (player.age >= 38) retirementChance = 50;
    else if (player.age >= 36) retirementChance = 20;
    else if (player.age >= 34) retirementChance = 8;
    else if (player.age >= 32) retirementChance = 2;
    
    // 能力低下による引退確率増加
    const avgAbility = player.abilities.reduce((a, b) => a + b, 0) / 6;
    if (avgAbility < 50) {
      retirementChance += 15;
    } else if (avgAbility < 60) {
      retirementChance += 5;
    }
    
    // 怪我による引退確率増加
    if (player.injured && player.injuryDays > 60) {
      retirementChance += 10;
    }
    
    if (this.random.int(1, 100) <= retirementChance) {
      result.retirement = true;
      player.retired = true;
      result.events.push('引退を発表');
      log.info(`Player retirement: ${player.name} (age ${Math.floor(player.age)})`);
    }
  }
  
  // 調子・モラール調整
  adjustCondition(player, result) {
    // 調子の変動 (50-150)
    const formChange = this.random.int(-10, 10);
    player.form = Math.max(50, Math.min(150, player.form + formChange));
    
    // モラールの変動 (0-200)
    let moraleChange = this.random.int(-5, 5);
    
    // 成長した場合はモラール向上
    if (result.abilityChange > 0) {
      moraleChange += result.abilityChange * 2;
    }
    
    // 覚醒した場合は大幅モラール向上
    if (result.awakening) {
      moraleChange += 20;
    }
    
    // 怪我した場合はモラール低下
    if (result.injury) {
      moraleChange -= 15;
    }
    
    player.morale = Math.max(0, Math.min(200, player.morale + moraleChange));
  }
  
  // 成長結果適用
  applyGrowthResult(player, result) {
    player.abilities = [...result.newAbilities];
    
    // 覚醒ボーナスをリセット
    if (player.awakeningBonus) {
      delete player.awakeningBonus;
    }
  }
  
  // 怪我回復処理
  processInjuryRecovery(players) {
    const recoveredPlayers = [];
    
    players.forEach(player => {
      if (player.injured && player.injuryDays > 0) {
        player.injuryDays -= 7; // 週次で7日減らす
        
        if (player.injuryDays <= 0) {
          player.injured = false;
          player.injuryDays = 0;
          delete player.injuryType;
          
          // 回復時は調子とモラールが若干低下
          player.form = Math.max(50, player.form - 10);
          player.morale = Math.max(0, player.morale - 5);
          
          recoveredPlayers.push(player);
          log.info(`Player recovered: ${player.name}`);
        }
      }
    });
    
    return recoveredPlayers;
  }
  
  // 成長統計作成
  createGrowthSummary(results) {
    return {
      totalPlayers: results.playerGrowth.length + results.awakenings.length + results.injuries.length,
      grownPlayers: results.playerGrowth.length,
      awakenedPlayers: results.awakenings.length,
      injuredPlayers: results.injuries.length,
      retiredPlayers: results.retirements.length,
      averageGrowth: results.playerGrowth.length > 0 ? 
        results.playerGrowth.reduce((sum, r) => sum + r.abilityChange, 0) / results.playerGrowth.length : 0
    };
  }
  
  // 能力名取得
  getAbilityName(index) {
    const names = ['スピード', 'パワー', 'テクニック', 'スタミナ', 'IQ', '運'];
    return names[index] || '不明';
  }
  
  // 全チーム成長処理（NPCチーム用）
  processAllTeamsGrowth(teams) {
    const results = [];
    
    teams.forEach(team => {
      if (team.players && team.players.length > 0) {
        const teamResult = this.processMonthlyGrowth(team, team.coach);
        teamResult.teamName = team.name;
        results.push(teamResult);
      }
    });
    
    return results;
  }
}

// グローバルインスタンス
const growthEngine = new GrowthEngine();

// デバッグ用
if (DEBUG) {
  console.log('Growth Engine initialized');
  
  // テスト用関数
  window.testGrowth = () => {
    const testPlayer = PlayerGenerator.generateRandomPlayer('regular', 'FW');
    console.log('Before growth:', testPlayer);
    
    const coach = CoachUtils.getRandomCoach(200000000);
    const result = growthEngine.processPlayerGrowth(testPlayer, coach, { players: [testPlayer] });
    
    console.log('After growth:', testPlayer);
    console.log('Growth result:', result);
    return result;
  };
}