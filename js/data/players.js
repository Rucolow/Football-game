/* ========================================
   選手データベース - 軽量化版
======================================== */

// 選手テンプレート定義
const PLAYER_TEMPLATES = {
  // スター選手テンプレート（3-7億KR）
  star: [
    {
      id: 'star_1',
      name: 'ゴールハンター',
      position: 'FW',
      ageRange: [23, 28],
      baseAbilities: [85, 90, 80, 85, 85, 80],
      costRange: [600000000, 700000000],
      personality: '天才肌',
      specialSkills: ['ゴールセンス', 'クリティカルシュート'],
      weaknesses: ['守備意識']
    },
    {
      id: 'star_2',
      name: 'プレイメーカー',
      position: 'MF',
      ageRange: [25, 30],
      baseAbilities: [75, 70, 95, 90, 95, 85],
      costRange: [500000000, 600000000],
      personality: '司令塔',
      specialSkills: ['パスセンス', '試合読み'],
      weaknesses: ['スピード']
    },
    {
      id: 'star_3',
      name: '鉄壁ディフェンダー',
      position: 'DF',
      ageRange: [26, 32],
      baseAbilities: [70, 95, 75, 90, 90, 80],
      costRange: [400000000, 500000000],
      personality: 'リーダー',
      specialSkills: ['守備安定', '空中戦'],
      weaknesses: ['攻撃参加']
    },
    {
      id: 'star_4',
      name: 'ミラクルキーパー',
      position: 'GK',
      ageRange: [24, 29],
      baseAbilities: [60, 80, 95, 85, 90, 95],
      costRange: [300000000, 400000000],
      personality: '集中力',
      specialSkills: ['反射神経', 'セーブ率'],
      weaknesses: ['足技']
    },
    {
      id: 'star_5',
      name: 'スピードスター',
      position: 'FW',
      ageRange: [20, 25],
      baseAbilities: [95, 75, 85, 90, 80, 85],
      costRange: [550000000, 650000000],
      personality: '努力家',
      specialSkills: ['スピード突破', 'カウンター'],
      weaknesses: ['体力']
    }
  ],
  
  // 優秀選手テンプレート（1-2.5億KR）
  excellent: [
    {
      id: 'exc_1',
      name: 'ベテランストライカー',
      position: 'FW',
      ageRange: [28, 33],
      baseAbilities: [70, 85, 75, 70, 80, 75],
      costRange: [180000000, 220000000],
      personality: 'ベテラン',
      specialSkills: ['経験値', 'ポジショニング'],
      weaknesses: ['スタミナ']
    },
    {
      id: 'exc_2',
      name: '中堅ミッドフィルダー',
      position: 'MF',
      ageRange: [24, 29],
      baseAbilities: [75, 70, 80, 85, 80, 70],
      costRange: [150000000, 200000000],
      personality: 'バランス',
      specialSkills: ['パス精度', '運動量'],
      weaknesses: ['決定力']
    },
    {
      id: 'exc_3',
      name: '堅実ディフェンダー',
      position: 'DF',
      ageRange: [25, 30],
      baseAbilities: [65, 80, 70, 80, 85, 70],
      costRange: [120000000, 160000000],
      personality: '堅実',
      specialSkills: ['守備安定', 'マークング'],
      weaknesses: ['攻撃力']
    },
    {
      id: 'exc_4',
      name: '安定キーパー',
      position: 'GK',
      ageRange: [26, 31],
      baseAbilities: [50, 70, 85, 80, 85, 80],
      costRange: [100000000, 140000000],
      personality: '冷静',
      specialSkills: ['安定性', 'ハイボール'],
      weaknesses: ['反応速度']
    },
    {
      id: 'exc_5',
      name: 'ワークホース',
      position: 'MF',
      ageRange: [23, 28],
      baseAbilities: [80, 75, 70, 90, 75, 70],
      costRange: [140000000, 180000000],
      personality: '働き者',
      specialSkills: ['運動量', 'ハードワーク'],
      weaknesses: ['技術']
    },
    {
      id: 'exc_6',
      name: 'サイドアタッカー',
      position: 'MF',
      ageRange: [22, 27],
      baseAbilities: [85, 65, 80, 85, 70, 75],
      costRange: [160000000, 200000000],
      personality: 'アグレッシブ',
      specialSkills: ['サイド突破', 'クロス'],
      weaknesses: ['守備']
    }
  ],
  
  // 普通選手テンプレート（0.3-0.9億KR）
  regular: [
    {
      id: 'reg_1',
      name: '若手ストライカー',
      position: 'FW',
      ageRange: [18, 23],
      baseAbilities: [70, 65, 60, 70, 65, 70],
      costRange: [60000000, 90000000],
      personality: '成長期',
      specialSkills: ['ポテンシャル'],
      weaknesses: ['経験不足']
    },
    {
      id: 'reg_2',
      name: 'ユーティリティ',
      position: 'MF',
      ageRange: [20, 25],
      baseAbilities: [65, 65, 65, 70, 70, 65],
      costRange: [50000000, 80000000],
      personality: 'オールラウンド',
      specialSkills: ['ポジション適応'],
      weaknesses: ['特化能力なし']
    },
    {
      id: 'reg_3',
      name: '控えディフェンダー',
      position: 'DF',
      ageRange: [19, 24],
      baseAbilities: [60, 70, 55, 65, 70, 60],
      costRange: [40000000, 70000000],
      personality: 'サブ',
      specialSkills: ['守備基礎'],
      weaknesses: ['攻撃力', 'スピード']
    },
    {
      id: 'reg_4',
      name: '新人キーパー',
      position: 'GK',
      ageRange: [18, 22],
      baseAbilities: [45, 60, 70, 65, 70, 65],
      costRange: [35000000, 60000000],
      personality: '新人',
      specialSkills: ['成長性'],
      weaknesses: ['経験', '判断力']
    },
    {
      id: 'reg_5',
      name: 'ベテラン控え',
      position: 'MF',
      ageRange: [30, 35],
      baseAbilities: [60, 70, 75, 60, 80, 70],
      costRange: [30000000, 50000000],
      personality: 'ベテラン控え',
      specialSkills: ['経験', 'メンタル'],
      weaknesses: ['体力', 'スピード']
    },
    {
      id: 'reg_6',
      name: '期待の若手',
      position: 'FW',
      ageRange: [16, 20],
      baseAbilities: [75, 55, 65, 75, 60, 80],
      costRange: [70000000, 90000000],
      personality: '期待株',
      specialSkills: ['スピード', '成長性'],
      weaknesses: ['技術', '判断力']
    }
  ]
};

// 名前データベース
const PLAYER_NAMES = {
  first: [
    '太郎', '次郎', '三郎', '健太', '翔太', '大輔', '拓也', '雄太', '智也', '亮太',
    '優斗', '蓮', '大翔', '陽向', '颯太', '湊', '樹', '悠人', '陸', '結翔',
    '龍', '海斗', '翼', '奏太', '瑛太', '遼', '蒼空', '琉生', '煌', '絢斗'
  ],
  last: [
    '田中', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '山田', '中村', '小林', '加藤',
    '吉田', '山本', '斎藤', '松本', '井上', '木村', '林', '清水', '山崎', '森田',
    '池田', '橋本', '石川', '前田', '藤田', '後藤', '岡田', '長谷川', '村上', '近藤'
  ]
};

// 性格特性データ
const PERSONALITIES = {
  '天才肌': {
    growthRate: 0.8,
    awakeningChance: 1.5,
    injuryRisk: 1.1,
    description: '高い潜在能力を持つが気まぐれ'
  },
  '努力家': {
    growthRate: 1.3,
    awakeningChance: 1.1,
    injuryRisk: 1.2,
    description: '継続的な成長を見込める'
  },
  'ムードメーカー': {
    growthRate: 1.1,
    awakeningChance: 1.2,
    injuryRisk: 0.9,
    description: 'チーム全体の調子を上げる'
  },
  '一匹狼': {
    growthRate: 1.0,
    awakeningChance: 1.4,
    injuryRisk: 0.8,
    description: '独特のプレースタイル'
  },
  'リーダー': {
    growthRate: 1.1,
    awakeningChance: 1.0,
    injuryRisk: 0.9,
    description: '他の選手に良い影響を与える'
  },
  'ベテラン': {
    growthRate: 0.7,
    awakeningChance: 0.8,
    injuryRisk: 1.3,
    description: '経験豊富だが衰えが始まっている'
  },
  '冷静': {
    growthRate: 1.0,
    awakeningChance: 0.9,
    injuryRisk: 0.8,
    description: '安定したパフォーマンス'
  },
  '情熱的': {
    growthRate: 1.2,
    awakeningChance: 1.3,
    injuryRisk: 1.4,
    description: '情熱的だが怪我をしやすい'
  }
};

// 選手生成ユーティリティ
const PlayerGenerator = {
  // ランダム選手生成
  generateRandomPlayer(tier = 'regular', position = null) {
    const templates = PLAYER_TEMPLATES[tier] || PLAYER_TEMPLATES.regular;
    let template;
    
    if (position) {
      const posTemplates = templates.filter(t => t.position === position);
      template = posTemplates.length > 0 ? random.choice(posTemplates) : random.choice(templates);
    } else {
      template = random.choice(templates);
    }
    
    return this.createPlayerFromTemplate(template, tier);
  },
  
  // テンプレートから選手作成
  createPlayerFromTemplate(template, tier) {
    const firstName = random.choice(PLAYER_NAMES.first);
    const lastName = random.choice(PLAYER_NAMES.last);
    const age = random.int(template.ageRange[0], template.ageRange[1]);
    const cost = random.int(template.costRange[0], template.costRange[1]);
    
    // 能力値にランダム要素を追加
    const abilities = template.baseAbilities.map(base => {
      const variation = tier === 'star' ? 5 : tier === 'excellent' ? 8 : 10;
      return Math.max(30, Math.min(99, base + random.int(-variation, variation)));
    });
    
    // 性格選択
    const personalityOptions = Object.keys(PERSONALITIES);
    const personality = template.personality === 'ランダム' ? 
      random.choice(personalityOptions) : 
      (personalityOptions.includes(template.personality) ? template.personality : random.choice(personalityOptions));
    
    return {
      id: `player_${Date.now()}_${random.int(1000, 9999)}`,
      name: `${lastName} ${firstName}`,
      position: template.position,
      age: age,
      abilities: abilities, // [スピード, パワー, テクニック, スタミナ, IQ, 運]
      cost: cost,
      tier: tier,
      personality: personality,
      specialSkills: [...template.specialSkills],
      weaknesses: [...template.weaknesses],
      injured: false,
      injuryDays: 0,
      growthPotential: this.calculateGrowthPotential(age, tier),
      form: 100, // 調子（50-150）
      morale: 100, // モラール（0-200）
      experience: this.calculateExperience(age),
      totalGames: 0,
      totalGoals: 0,
      createdAt: new Date().toISOString()
    };
  },
  
  // 成長ポテンシャル計算
  calculateGrowthPotential(age, tier) {
    let base;
    switch (tier) {
      case 'star': base = 85; break;
      case 'excellent': base = 70; break;
      default: base = 60; break;
    }
    
    // 年齢による補正
    if (age <= 20) base += 15;
    else if (age <= 23) base += 10;
    else if (age <= 26) base += 5;
    else if (age <= 29) base += 0;
    else if (age <= 32) base -= 10;
    else base -= 20;
    
    return Math.max(40, Math.min(99, base + random.int(-5, 5)));
  },
  
  // 経験値計算
  calculateExperience(age) {
    if (age <= 18) return random.int(0, 20);
    if (age <= 22) return random.int(10, 40);
    if (age <= 26) return random.int(30, 70);
    if (age <= 30) return random.int(50, 90);
    return random.int(70, 99);
  },
  
  // チーム用選手群生成
  generateTeamPlayers(budget, formationType = 'balanced') {
    const players = [];
    const positions = this.getPositionDistribution(formationType);
    
    // 予算配分
    const budgetDistribution = this.calculateBudgetDistribution(budget, formationType);
    
    // ポジション別に選手生成
    Object.entries(positions).forEach(([position, count]) => {
      const positionBudget = budgetDistribution[position] || 0;
      const avgCostPerPlayer = positionBudget / count;
      
      for (let i = 0; i < count; i++) {
        const tier = this.determineTier(avgCostPerPlayer);
        const player = this.generateRandomPlayer(tier, position);
        
        // コスト調整
        player.cost = Math.min(player.cost, positionBudget * 0.8);
        players.push(player);
      }
    });
    
    // 総額が予算を超えないよう調整
    this.adjustTeamBudget(players, budget);
    
    return players;
  },
  
  // ポジション配分取得
  getPositionDistribution(formationType) {
    const distributions = {
      balanced: { GK: 2, DF: 6, MF: 8, FW: 4 },
      defensive: { GK: 2, DF: 8, MF: 6, FW: 4 },
      offensive: { GK: 2, DF: 5, MF: 7, FW: 6 }
    };
    
    return distributions[formationType] || distributions.balanced;
  },
  
  // 予算配分計算
  calculateBudgetDistribution(totalBudget, formationType) {
    const distributions = {
      balanced: { GK: 0.15, DF: 0.35, MF: 0.35, FW: 0.15 },
      defensive: { GK: 0.20, DF: 0.45, MF: 0.25, FW: 0.10 },
      offensive: { GK: 0.10, DF: 0.20, MF: 0.30, FW: 0.40 }
    };
    
    const dist = distributions[formationType] || distributions.balanced;
    const result = {};
    
    Object.entries(dist).forEach(([position, ratio]) => {
      result[position] = totalBudget * ratio;
    });
    
    return result;
  },
  
  // ティア決定
  determineTier(avgCost) {
    if (avgCost >= 300000000) return 'star';
    if (avgCost >= 100000000) return 'excellent';
    return 'regular';
  },
  
  // チーム予算調整
  adjustTeamBudget(players, maxBudget) {
    const totalCost = players.reduce((sum, player) => sum + player.cost, 0);
    
    if (totalCost > maxBudget) {
      const ratio = maxBudget / totalCost;
      players.forEach(player => {
        player.cost = Math.floor(player.cost * ratio);
      });
    }
  }
};

// 選手関連ユーティリティ
const PlayerUtils = {
  // 選手総合力計算
  calculatePlayerPower(player) {
    const positionWeights = {
      GK: [0.5, 1.2, 2.0, 1.0, 1.5, 1.0],
      DF: [1.0, 1.5, 1.0, 1.2, 1.3, 1.0],
      MF: [1.2, 1.0, 1.3, 1.5, 1.2, 1.0],
      FW: [1.5, 1.3, 1.3, 1.0, 1.2, 1.2]
    };
    
    const weights = positionWeights[player.position] || [1, 1, 1, 1, 1, 1];
    const weightedSum = player.abilities.reduce((sum, ability, index) => {
      return sum + (ability * weights[index]);
    }, 0);
    
    return Math.round(weightedSum / weights.reduce((sum, w) => sum + w, 0));
  },
  
  // 年齢による成長率計算
  getAgeGrowthRate(age) {
    if (age <= 18) return 1.5;
    if (age <= 22) return 1.2;
    if (age <= 26) return 1.0;
    if (age <= 29) return 0.8;
    if (age <= 32) return 0.5;
    return 0.2;
  },
  
  // 選手の市場価値計算
  calculateMarketValue(player) {
    const basePower = this.calculatePlayerPower(player);
    const ageMultiplier = this.getAgeGrowthRate(player.age);
    const tierMultiplier = { star: 1.5, excellent: 1.2, regular: 1.0 }[player.tier] || 1.0;
    
    return Math.round(basePower * ageMultiplier * tierMultiplier * 1000000); // 百万KR単位
  },
  
  // 怪我確率計算
  calculateInjuryRisk(player, coach = null) {
    let baseRisk = 5; // 5%
    
    // 年齢による影響
    if (player.age >= 30) baseRisk += 2;
    if (player.age >= 33) baseRisk += 3;
    
    // 性格による影響
    const personalityEffect = PERSONALITIES[player.personality];
    if (personalityEffect) {
      baseRisk *= personalityEffect.injuryRisk;
    }
    
    // 監督による影響
    if (coach && coach.injuryRisk) {
      baseRisk *= coach.injuryRisk;
    }
    
    return Math.max(1, Math.min(20, Math.round(baseRisk)));
  },
  
  // 覚醒確率計算
  calculateAwakeningChance(player, coach = null) {
    let baseChance = 10; // 10%
    
    // 年齢による影響
    if (player.age <= 22) baseChance += 5;
    if (player.age >= 30) baseChance -= 5;
    
    // ポテンシャルによる影響
    baseChance += Math.floor((player.growthPotential - 60) / 5);
    
    // 性格による影響
    const personalityEffect = PERSONALITIES[player.personality];
    if (personalityEffect) {
      baseChance *= personalityEffect.awakeningChance;
    }
    
    // 監督による影響
    if (coach && coach.awakeningBonus) {
      baseChance *= coach.awakeningBonus;
    }
    
    return Math.max(1, Math.min(25, Math.round(baseChance)));
  },
  
  // 選手説明文生成
  generatePlayerDescription(player) {
    const power = this.calculatePlayerPower(player);
    const marketValue = this.calculateMarketValue(player);
    
    let description = `${player.position} | ${player.age}歳 | 総合力: ${power}\n`;
    description += `市場価値: ${formatNumber(marketValue)}KR\n`;
    description += `性格: ${player.personality}\n`;
    description += `特技: ${player.specialSkills.join('、')}\n`;
    description += `弱点: ${player.weaknesses.join('、')}`;
    
    return description;
  }
};

// データ検証とログ
if (DEBUG) {
  let totalTemplates = 0;
  Object.entries(PLAYER_TEMPLATES).forEach(([tier, templates]) => {
    totalTemplates += templates.length;
    console.log(`${tier} tier: ${templates.length} templates`);
  });
  
  console.log(`Total player templates: ${totalTemplates}`);
  console.log(`Player names: ${PLAYER_NAMES.first.length} first, ${PLAYER_NAMES.last.length} last`);
  console.log(`Personalities: ${Object.keys(PERSONALITIES).length}`);
}