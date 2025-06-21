/* ========================================
   チーム編成システム - 手動・自動チーム構築
======================================== */

class TeamBuilder {
  constructor() {
    this.version = '1.0.0';
    this.debug = DEBUG;
  }
  
  // 自動チーム編成
  buildAutoTeam(budget, teamType = 'balanced', coachBudget = null) {
    try {
      log.info(`Building auto team with budget: ${formatNumber(budget)}KR`);
      
      // 予算配分
      const budgetAllocation = this.calculateBudgetAllocation(budget, coachBudget);
      
      // 監督選択
      const coach = this.selectCoach(budgetAllocation.coach, teamType);
      
      // 選手編成
      const players = this.selectPlayers(budgetAllocation.players, teamType, coach);
      
      // 戦術設定
      const tactics = this.selectTactics(teamType, coach);
      
      const team = {
        coach: coach,
        players: players,
        tactics: tactics,
        stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
        totalCost: this.calculateTotalCost(coach, players),
        formation: this.getFormationName(tactics.formation),
        strength: this.calculateTeamStrength(players, coach, tactics)
      };
      
      log.info(`Auto team built: ${players.length} players, strength: ${team.strength}`);
      return team;
      
    } catch (error) {
      log.error('Auto team building failed', error);
      return this.buildFallbackTeam(budget);
    }
  }
  
  // 予算配分計算
  calculateBudgetAllocation(totalBudget, coachBudget = null) {
    // デフォルト配分: 監督20%, 選手80%
    const coachBudgetAmount = coachBudget || Math.floor(totalBudget * 0.2);
    const playerBudgetAmount = totalBudget - coachBudgetAmount;
    
    return {
      coach: coachBudgetAmount,
      players: playerBudgetAmount,
      total: totalBudget
    };
  }
  
  // 監督選択
  selectCoach(budget, teamType) {
    try {
      const availableCoaches = CoachUtils.getCoachesByBudget(budget);
      
      if (!availableCoaches.length) {
        log.warn('No coaches available within budget');
        return null;
      }
      
      // チームタイプに基づいて監督選択
      const selectedCoach = CoachUtils.selectCoachForAutoFormation(teamType, budget);
      
      log.info(`Selected coach: ${selectedCoach.name} (${formatNumber(selectedCoach.cost)}KR)`);
      return selectedCoach;
      
    } catch (error) {
      log.error('Coach selection failed', error);
      return CoachUtils.getRandomCoach(budget);
    }
  }
  
  // 選手選択
  selectPlayers(budget, teamType, coach) {
    try {
      // ポジション配分決定
      const positionDistribution = this.getPositionDistribution(teamType);
      
      // 予算をポジション別に配分
      const positionBudgets = this.allocatePositionBudgets(budget, positionDistribution, teamType);
      
      const players = [];
      
      // ポジション別に選手選択
      Object.entries(positionDistribution).forEach(([position, count]) => {
        const positionBudget = positionBudgets[position];
        const positionPlayers = this.selectPositionPlayers(position, count, positionBudget, teamType);
        players.push(...positionPlayers);
      });
      
      // 予算調整
      this.adjustPlayerBudgets(players, budget);
      
      log.info(`Selected ${players.length} players for total: ${formatNumber(this.calculatePlayersCost(players))}KR`);
      return players;
      
    } catch (error) {
      log.error('Player selection failed', error);
      return this.generateFallbackPlayers(budget);
    }
  }
  
  // ポジション配分取得
  getPositionDistribution(teamType) {
    const distributions = {
      balanced: { GK: 2, DF: 6, MF: 8, FW: 4 },
      defensive: { GK: 2, DF: 8, MF: 6, FW: 4 },
      offensive: { GK: 2, DF: 5, MF: 7, FW: 6 },
      youth: { GK: 2, DF: 6, MF: 8, FW: 4 }, // 若手重視
      experienced: { GK: 2, DF: 6, MF: 8, FW: 4 } // ベテラン重視
    };
    
    return distributions[teamType] || distributions.balanced;
  }
  
  // ポジション別予算配分
  allocatePositionBudgets(totalBudget, distribution, teamType) {
    const budgetRatios = {
      balanced: { GK: 0.15, DF: 0.35, MF: 0.35, FW: 0.15 },
      defensive: { GK: 0.20, DF: 0.45, MF: 0.25, FW: 0.10 },
      offensive: { GK: 0.10, DF: 0.20, MF: 0.30, FW: 0.40 },
      youth: { GK: 0.12, DF: 0.30, MF: 0.33, FW: 0.25 },
      experienced: { GK: 0.18, DF: 0.38, MF: 0.32, FW: 0.12 }
    };
    
    const ratios = budgetRatios[teamType] || budgetRatios.balanced;
    const budgets = {};
    
    Object.entries(ratios).forEach(([position, ratio]) => {
      budgets[position] = Math.floor(totalBudget * ratio);
    });
    
    return budgets;
  }
  
  // ポジション別選手選択
  selectPositionPlayers(position, count, budget, teamType) {
    const avgBudgetPerPlayer = Math.floor(budget / count);
    const players = [];
    
    // 選手ティア決定
    const tierDistribution = this.getTierDistribution(avgBudgetPerPlayer, teamType);
    
    for (let i = 0; i < count; i++) {
      const tier = this.selectPlayerTier(tierDistribution, i, count);
      let player;
      
      // 選手生成を試行
      let attempts = 0;
      do {
        player = PlayerGenerator.generateRandomPlayer(tier, position);
        attempts++;
      } while (player.cost > avgBudgetPerPlayer * 1.5 && attempts < 5);
      
      // 予算調整
      if (player.cost > avgBudgetPerPlayer * 1.3) {
        player.cost = Math.floor(avgBudgetPerPlayer * random.float(0.8, 1.2));
      }
      
      players.push(player);
    }
    
    return players;
  }
  
  // ティア分布取得
  getTierDistribution(avgBudget, teamType) {
    if (avgBudget >= 300000000) {
      // 高予算: スター選手多め
      return { star: 0.4, excellent: 0.4, regular: 0.2 };
    } else if (avgBudget >= 150000000) {
      // 中予算: 優秀選手中心
      return { star: 0.2, excellent: 0.6, regular: 0.2 };
    } else {
      // 低予算: 普通選手中心
      return { star: 0.1, excellent: 0.3, regular: 0.6 };
    }
  }
  
  // 選手ティア選択
  selectPlayerTier(distribution, playerIndex, totalPlayers) {
    const rand = random.float(0, 1);
    
    // 最初の選手は良い選手になりやすい
    if (playerIndex === 0) {
      if (rand < distribution.star * 1.5) return 'star';
      if (rand < (distribution.star + distribution.excellent) * 1.2) return 'excellent';
    }
    
    if (rand < distribution.star) return 'star';
    if (rand < distribution.star + distribution.excellent) return 'excellent';
    return 'regular';
  }
  
  // 選手予算調整
  adjustPlayerBudgets(players, maxBudget) {
    const totalCost = this.calculatePlayersCost(players);
    
    if (totalCost > maxBudget) {
      const ratio = maxBudget / totalCost;
      players.forEach(player => {
        player.cost = Math.floor(player.cost * ratio);
      });
    }
  }
  
  // 戦術選択
  selectTactics(teamType, coach) {
    let tactics = { formation: 1, attack: 2, defense: 2 }; // デフォルト: 4-4-2, バランス
    
    // チームタイプに基づく戦術
    switch (teamType) {
      case 'offensive':
        tactics = {
          formation: random.choice([2, 6, 11]), // 4-3-3, 3-4-3, 3-3-4
          attack: random.choice([1, 3]), // 速攻 or ポゼッション
          defense: 1 // プレス
        };
        break;
        
      case 'defensive':
        tactics = {
          formation: random.choice([4, 8, 9]), // 5-3-2, 3-6-1, 5-4-1
          attack: 2, // バランス
          defense: 3 // リトリート
        };
        break;
        
      case 'balanced':
        tactics = {
          formation: random.choice([1, 5, 7]), // 4-4-2, 4-5-1, 4-2-3-1
          attack: 2, // バランス
          defense: 2 // バランス
        };
        break;
        
      case 'youth':
        tactics = {
          formation: random.choice([2, 3, 6]), // 4-3-3, 3-5-2, 3-4-3
          attack: 1, // 速攻
          defense: 1 // プレス
        };
        break;
        
      case 'experienced':
        tactics = {
          formation: random.choice([1, 4, 5]), // 4-4-2, 5-3-2, 4-5-1
          attack: 3, // ポゼッション
          defense: 2 // バランス
        };
        break;
    }
    
    // 監督の相性を考慮して調整
    if (coach) {
      const compatibleTactics = CoachUtils.getCompatibleTactics(coach);
      
      // 相性の良いフォーメーションがあれば優先
      if (compatibleTactics.formations.length > 0) {
        const compatibleFormations = compatibleTactics.formations.filter(f => 
          f >= 1 && f <= 12
        );
        if (compatibleFormations.length > 0) {
          tactics.formation = random.choice(compatibleFormations);
        }
      }
      
      // 攻撃戦術も同様
      if (compatibleTactics.attacks.length > 0) {
        tactics.attack = random.choice(compatibleTactics.attacks);
      }
      
      // 守備戦術も同様
      if (compatibleTactics.defenses.length > 0) {
        tactics.defense = random.choice(compatibleTactics.defenses);
      }
    }
    
    return tactics;
  }
  
  // チーム総合力計算
  calculateTeamStrength(players, coach, tactics) {
    if (!players.length) return 50;
    
    // 選手の平均能力
    const avgPlayerPower = players.reduce((sum, player) => {
      return sum + PlayerUtils.calculatePlayerPower(player);
    }, 0) / players.length;
    
    // 監督ボーナス
    let coachBonus = 1.0;
    if (coach) {
      const coachPower = coach.abilities.reduce((sum, ability) => sum + ability, 0);
      coachBonus = 1.0 + (coachPower - 24) * 0.01;
    }
    
    // 戦術ボーナス（簡易版）
    const tacticalBonus = 1.0 + (tactics.formation <= 6 ? 0.02 : 0.01);
    
    return Math.round(avgPlayerPower * coachBonus * tacticalBonus);
  }
  
  // 手動チーム編成支援
  getAvailablePlayers(position, budget, tier = null) {
    const players = [];
    const tiers = tier ? [tier] : ['star', 'excellent', 'regular'];
    
    tiers.forEach(currentTier => {
      for (let i = 0; i < 10; i++) { // 各ティアから10人生成
        const player = PlayerGenerator.generateRandomPlayer(currentTier, position);
        if (player.cost <= budget) {
          players.push(player);
        }
      }
    });
    
    // コストと能力でソート
    return players
      .sort((a, b) => {
        const aPower = PlayerUtils.calculatePlayerPower(a);
        const bPower = PlayerUtils.calculatePlayerPower(b);
        return bPower - aPower; // 能力の高い順
      })
      .slice(0, 20); // 上位20人
  }
  
  // 推奨選手取得
  getRecommendedPlayers(position, budget, teamType = 'balanced') {
    const recommendations = [];
    
    // 予算別に推奨選手を生成
    const budgetRanges = [
      { min: budget * 0.8, max: budget, label: '予算内最高' },
      { min: budget * 0.5, max: budget * 0.8, label: 'バランス型' },
      { min: budget * 0.2, max: budget * 0.5, label: '節約型' }
    ];
    
    budgetRanges.forEach(range => {
      const players = this.getAvailablePlayers(position, range.max)
        .filter(p => p.cost >= range.min && p.cost <= range.max);
      
      if (players.length > 0) {
        recommendations.push({
          category: range.label,
          players: players.slice(0, 5) // 各カテゴリから5人
        });
      }
    });
    
    return recommendations;
  }
  
  // チーム編成検証
  validateTeamFormation(team) {
    const issues = [];
    
    // 選手数チェック
    if (!team.players || team.players.length < 11) {
      issues.push('選手が11人未満です');
    }
    
    if (team.players && team.players.length > 20) {
      issues.push('選手が20人を超えています');
    }
    
    // ポジション別チェック
    if (team.players) {
      const positions = { GK: 0, DF: 0, MF: 0, FW: 0 };
      team.players.forEach(player => {
        if (positions[player.position] !== undefined) {
          positions[player.position]++;
        }
      });
      
      if (positions.GK < 1) issues.push('ゴールキーパーが不足しています');
      if (positions.DF < 3) issues.push('ディフェンダーが不足しています');
      if (positions.MF < 3) issues.push('ミッドフィルダーが不足しています');
      if (positions.FW < 1) issues.push('フォワードが不足しています');
      
      if (positions.GK > 3) issues.push('ゴールキーパーが多すぎます');
      if (positions.DF > 8) issues.push('ディフェンダーが多すぎます');
      if (positions.MF > 8) issues.push('ミッドフィルダーが多すぎます');
      if (positions.FW > 6) issues.push('フォワードが多すぎます');
    }
    
    // 予算チェック
    const totalCost = this.calculateTotalCost(team.coach, team.players || []);
    if (totalCost > 2800000000) { // 28億KR
      issues.push('予算を超過しています');
    }
    
    // 監督チェック
    if (!team.coach) {
      issues.push('監督が選択されていません');
    }
    
    // 戦術チェック
    if (!team.tactics) {
      issues.push('戦術が設定されていません');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
  
  // チーム編成最適化
  optimizeTeamFormation(team, targetBudget = null) {
    if (!team.players) return team;
    
    const optimizedTeam = { ...team };
    optimizedTeam.players = [...team.players];
    
    const budget = targetBudget || 2800000000;
    let currentCost = this.calculateTotalCost(team.coach, team.players);
    
    if (currentCost > budget) {
      // 予算超過の場合、コストパフォーマンスの悪い選手を入れ替え
      optimizedTeam.players.sort((a, b) => {
        const aCostPerformance = PlayerUtils.calculatePlayerPower(a) / (a.cost / 1000000);
        const bCostPerformance = PlayerUtils.calculatePlayerPower(b) / (b.cost / 1000000);
        return aCostPerformance - bCostPerformance;
      });
      
      // 下位選手を安い選手に入れ替え
      for (let i = 0; i < optimizedTeam.players.length && currentCost > budget; i++) {
        const oldPlayer = optimizedTeam.players[i];
        const newPlayer = PlayerGenerator.generateRandomPlayer('regular', oldPlayer.position);
        
        if (newPlayer.cost < oldPlayer.cost) {
          currentCost -= oldPlayer.cost;
          currentCost += newPlayer.cost;
          optimizedTeam.players[i] = newPlayer;
        }
      }
    }
    
    // 戦術最適化
    if (optimizedTeam.coach) {
      const compatibleTactics = CoachUtils.getCompatibleTactics(optimizedTeam.coach);
      if (compatibleTactics.formations.length > 0) {
        optimizedTeam.tactics.formation = compatibleTactics.formations[0];
      }
    }
    
    return optimizedTeam;
  }
  
  // ユーティリティ関数
  calculateTotalCost(coach, players) {
    const coachCost = coach ? coach.cost : 0;
    const playersCost = this.calculatePlayersCost(players);
    return coachCost + playersCost;
  }
  
  calculatePlayersCost(players) {
    return players.reduce((sum, player) => sum + player.cost, 0);
  }
  
  getFormationName(formationId) {
    const formations = {
      1: '4-4-2', 2: '4-3-3', 3: '3-5-2', 4: '5-3-2',
      5: '4-5-1', 6: '3-4-3', 7: '4-2-3-1', 8: '3-6-1',
      9: '5-4-1', 10: '4-1-4-1', 11: '3-3-4', 12: '5-2-3'
    };
    return formations[formationId] || '4-4-2';
  }
  
  // フォールバック機能
  buildFallbackTeam(budget) {
    log.warn('Building fallback team');
    
    return {
      coach: CoachUtils.getRandomCoach(Math.floor(budget * 0.2)),
      players: PlayerGenerator.generateTeamPlayers(Math.floor(budget * 0.8), 'balanced'),
      tactics: { formation: 1, attack: 2, defense: 2 },
      stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      totalCost: budget,
      formation: '4-4-2',
      strength: 65
    };
  }
  
  generateFallbackPlayers(budget) {
    return PlayerGenerator.generateTeamPlayers(budget, 'balanced');
  }
}

// グローバルインスタンス
const teamBuilder = new TeamBuilder();

// デバッグ用
if (DEBUG) {
  console.log('Team Builder initialized');
  
  // テスト用関数
  window.testTeamBuilder = () => {
    const team = teamBuilder.buildAutoTeam(2800000000, 'balanced');
    console.log('Auto-built team:', team);
    
    const validation = teamBuilder.validateTeamFormation(team);
    console.log('Validation:', validation);
    
    return team;
  };
  
  window.testPlayerRecommendations = (position = 'FW', budget = 200000000) => {
    const recommendations = teamBuilder.getRecommendedPlayers(position, budget);
    console.log(`Recommendations for ${position} with budget ${formatNumber(budget)}KR:`, recommendations);
    return recommendations;
  };
}