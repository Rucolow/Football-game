/* ========================================
   監督データベース - 軽量化版
======================================== */

// 監督データ定義
const COACHES_DATA = [
  {
    id: 1,
    name: '熱血 闘志',
    type: 'passionate',
    description: '選手の成長率が高いが、怪我のリスクも上がる',
    abilities: [9, 6, 8, 7], // [カリスマ, 共感, 指導力, 運]
    cost: 180000000, // 1.8億KR
    personality: '熱血系',
    specialties: ['成長促進', 'モチベーション向上'],
    growthBonus: 1.3,
    injuryRisk: 1.2,
    awakeningBonus: 1.1
  },
  {
    id: 2,
    name: '冷静 アイス',
    type: 'analytical',
    description: '戦術理解が深く、安定した成績を残す',
    abilities: [6, 8, 9, 6],
    cost: 220000000, // 2.2億KR
    personality: '理論派',
    specialties: ['戦術指導', '安定性'],
    growthBonus: 1.0,
    injuryRisk: 0.8,
    awakeningBonus: 0.9
  },
  {
    id: 3,
    name: '経験 ベテラン',
    type: 'experienced',
    description: '豊富な経験で選手の潜在能力を引き出す',
    abilities: [8, 9, 7, 8],
    cost: 350000000, // 3.5億KR
    personality: 'ベテラン',
    specialties: ['経験値', '人心掌握'],
    growthBonus: 1.1,
    injuryRisk: 0.9,
    awakeningBonus: 1.3
  },
  {
    id: 4,
    name: '若手 フューチャー',
    type: 'young',
    description: '若い感性で選手との距離が近い',
    abilities: [7, 9, 6, 7],
    cost: 120000000, // 1.2億KR
    personality: '若手',
    specialties: ['若手育成', 'コミュニケーション'],
    growthBonus: 1.2,
    injuryRisk: 1.0,
    awakeningBonus: 1.2
  },
  {
    id: 5,
    name: '戦術 マスター',
    type: 'tactical',
    description: '複雑な戦術を巧みに使いこなす',
    abilities: [7, 7, 10, 6],
    cost: 280000000, // 2.8億KR
    personality: '戦術家',
    specialties: ['戦術多様性', 'システム構築'],
    growthBonus: 0.9,
    injuryRisk: 0.9,
    awakeningBonus: 0.8
  },
  {
    id: 6,
    name: '運命 ラッキー',
    type: 'lucky',
    description: '不思議と運に恵まれる監督',
    abilities: [6, 7, 6, 10],
    cost: 150000000, // 1.5億KR
    personality: '幸運',
    specialties: ['運向上', 'サプライズ'],
    growthBonus: 1.0,
    injuryRisk: 0.7,
    awakeningBonus: 1.4
  },
  {
    id: 7,
    name: '厳格 ストリクト',
    type: 'strict',
    description: '厳しい指導で選手を鍛え上げる',
    abilities: [8, 5, 9, 7],
    cost: 200000000, // 2.0億KR
    personality: '厳格',
    specialties: ['規律', '基礎技術'],
    growthBonus: 1.1,
    injuryRisk: 1.1,
    awakeningBonus: 0.9
  },
  {
    id: 8,
    name: '自由 フリー',
    type: 'free',
    description: '選手の自主性を重んじる指導スタイル',
    abilities: [7, 8, 7, 8],
    cost: 160000000, // 1.6億KR
    personality: '自由',
    specialties: ['創造性', '個性重視'],
    growthBonus: 1.0,
    injuryRisk: 0.9,
    awakeningBonus: 1.2
  },
  {
    id: 9,
    name: '完璧 パーフェクト',
    type: 'perfectionist',
    description: '完璧主義でバランスの取れた指導',
    abilities: [8, 8, 8, 8],
    cost: 400000000, // 4.0億KR
    personality: '完璧主義',
    specialties: ['バランス', '総合力'],
    growthBonus: 1.15,
    injuryRisk: 0.95,
    awakeningBonus: 1.15
  },
  {
    id: 10,
    name: '革新 イノベーター',
    type: 'innovative',
    description: '新しい手法で選手を驚かせる',
    abilities: [9, 7, 8, 9],
    cost: 320000000, // 3.2億KR
    personality: '革新的',
    specialties: ['新戦術', '意外性'],
    growthBonus: 1.05,
    injuryRisk: 1.05,
    awakeningBonus: 1.3
  }
];

// 監督関連のユーティリティ関数
const CoachUtils = {
  // 全監督取得
  getAllCoaches() {
    return [...COACHES_DATA];
  },
  
  // 予算内の監督取得
  getCoachesByBudget(maxBudget) {
    return COACHES_DATA.filter(coach => coach.cost <= maxBudget);
  },
  
  // IDで監督取得
  getCoachById(id) {
    return COACHES_DATA.find(coach => coach.id === id);
  },
  
  // タイプで監督取得
  getCoachesByType(type) {
    return COACHES_DATA.filter(coach => coach.type === type);
  },
  
  // ランダム監督取得
  getRandomCoach(maxBudget = null) {
    const availableCoaches = maxBudget ? 
      this.getCoachesByBudget(maxBudget) : 
      COACHES_DATA;
    
    return random.choice(availableCoaches);
  },
  
  // 監督能力値計算
  calculateCoachPower(coach) {
    return coach.abilities.reduce((sum, ability) => sum + ability, 0);
  },
  
  // 特定能力の監督取得
  getCoachesBy ability(abilityIndex, minValue) {
    return COACHES_DATA.filter(coach => coach.abilities[abilityIndex] >= minValue);
  },
  
  // コストパフォーマンス計算
  calculateCostPerformance(coach) {
    const totalAbility = this.calculateCoachPower(coach);
    return Math.round(totalAbility / (coach.cost / 100000000) * 100) / 100;
  },
  
  // 監督推奨度計算（初心者向け）
  getRecommendationScore(coach) {
    const costPerformance = this.calculateCostPerformance(coach);
    const balanceScore = coach.abilities.reduce((min, ability) => Math.min(min, ability), 10);
    
    return Math.round((costPerformance * 0.6 + balanceScore * 0.4) * 10) / 10;
  },
  
  // 監督説明文生成
  generateCoachDescription(coach) {
    const powerLevel = this.calculateCoachPower(coach);
    const costPerformance = this.calculateCostPerformance(coach);
    
    let description = coach.description + '\n\n';
    description += `総合力: ${powerLevel}/40\n`;
    description += `コスパ: ${costPerformance}\n`;
    description += `特徴: ${coach.specialties.join('、')}`;
    
    return description;
  },
  
  // 相性の良い戦術取得
  getCompatibleTactics(coach) {
    const tactics = {
      passionate: { formations: [1, 3, 6], attacks: [1], defenses: [1] }, // 攻撃的
      analytical: { formations: [5, 7, 9], attacks: [2], defenses: [2] }, // バランス
      experienced: { formations: [2, 4, 8], attacks: [2, 3], defenses: [2, 3] }, // 安定
      young: { formations: [3, 6, 11], attacks: [1, 2], defenses: [1] }, // 積極的
      tactical: { formations: [7, 10, 12], attacks: [2, 3], defenses: [2, 3] }, // 複雑
      lucky: { formations: [1, 2, 3, 4, 5, 6], attacks: [1, 2, 3], defenses: [1, 2, 3] }, // 何でも
      strict: { formations: [5, 8, 9], attacks: [2], defenses: [3] }, // 守備的
      free: { formations: [3, 6, 11], attacks: [1, 3], defenses: [1] }, // 自由
      perfectionist: { formations: [2, 4, 7], attacks: [2], defenses: [2] }, // バランス
      innovative: { formations: [10, 11, 12], attacks: [1, 3], defenses: [1, 3] } // 新戦術
    };
    
    return tactics[coach.type] || tactics.analytical;
  },
  
  // 監督効果適用
  applyCoachEffects(player, coach) {
    // 成長ボーナス適用
    const growthRate = coach.growthBonus || 1.0;
    
    // 覚醒確率ボーナス
    const awakeningRate = coach.awakeningBonus || 1.0;
    
    // 怪我リスク
    const injuryRate = coach.injuryRisk || 1.0;
    
    return {
      growthRate,
      awakeningRate,
      injuryRate
    };
  },
  
  // 自動編成用監督選択
  selectCoachForAutoFormation(type, budget) {
    const availableCoaches = this.getCoachesByBudget(budget);
    
    switch (type) {
      case 'random':
        return random.choice(availableCoaches);
        
      case 'balanced':
        // バランスの良い監督を選択
        const balancedCoaches = availableCoaches.filter(coach => {
          const abilities = coach.abilities;
          const max = Math.max(...abilities);
          const min = Math.min(...abilities);
          return max - min <= 3; // 能力差が3以下
        });
        return balancedCoaches.length > 0 ? random.choice(balancedCoaches) : random.choice(availableCoaches);
        
      case 'offensive':
        // 攻撃的な監督を選択
        const offensiveCoaches = availableCoaches.filter(coach => 
          ['passionate', 'young', 'free', 'innovative'].includes(coach.type)
        );
        return offensiveCoaches.length > 0 ? random.choice(offensiveCoaches) : random.choice(availableCoaches);
        
      default:
        return random.choice(availableCoaches);
    }
  }
};

// データ検証
if (DEBUG) {
  // 監督データの整合性チェック
  COACHES_DATA.forEach(coach => {
    if (!coach.id || !coach.name || !coach.abilities || coach.abilities.length !== 4) {
      console.error('Invalid coach data:', coach);
    }
    
    if (coach.cost <= 0 || coach.cost > 500000000) {
      console.warn('Unusual coach cost:', coach.name, coach.cost);
    }
  });
  
  console.log(`Loaded ${COACHES_DATA.length} coaches`);
}