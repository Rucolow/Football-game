/* ========================================
   試合計算エンジン - 試合シミュレーション
======================================== */

class MatchEngine {
  constructor() {
    this.version = '1.0.0';
    this.random = random;
    this.debug = DEBUG;
  }
  
  // 試合実行
  simulateMatch(homeTeam, awayTeam, day = 1) {
    try {
      log.info(`Simulating match: ${homeTeam.name} vs ${awayTeam.name}`);
      
      // 試合前準備
      const matchData = this.prepareMatch(homeTeam, awayTeam, day);
      
      // 試合シミュレーション
      const result = this.calculateMatch(matchData);
      
      // 結果処理
      this.processMatchResult(result, homeTeam, awayTeam);
      
      log.info(`Match result: ${result.homeScore}-${result.awayScore}`);
      return result;
      
    } catch (error) {
      log.error('Match simulation failed', error);
      // フォールバック: ランダム結果
      return this.generateFallbackResult(homeTeam, awayTeam, day);
    }
  }
  
  // 試合準備
  prepareMatch(homeTeam, awayTeam, day) {
    return {
      home: {
        team: homeTeam,
        tactics: { ...homeTeam.tactics },
        players: homeTeam.players.filter(p => !p.injured),
        coach: homeTeam.coach,
        homeAdvantage: 1.1 // ホーム有利補正
      },
      away: {
        team: awayTeam,
        tactics: { ...awayTeam.tactics },
        players: awayTeam.players.filter(p => !p.injured),
        coach: awayTeam.coach,
        homeAdvantage: 1.0
      },
      day: day,
      weather: this.generateWeather(),
      referee: this.generateReferee()
    };
  }
  
  // 試合計算
  calculateMatch(matchData) {
    const home = matchData.home;
    const away = matchData.away;
    
    // チーム力計算
    const homePower = this.calculateTeamPower(home);
    const awayPower = this.calculateTeamPower(away);
    
    // 戦術相性
    const tacticalAdvantage = this.calculateTacticalAdvantage(home.tactics, away.tactics);
    
    // 総合力計算
    const homeTotal = homePower * tacticalAdvantage.home * home.homeAdvantage;
    const awayTotal = awayPower * tacticalAdvantage.away * away.homeAdvantage;
    
    // 試合展開シミュレーション
    const matchEvents = this.simulateMatchEvents(homeTotal, awayTotal, matchData);
    
    // スコア計算
    const homeScore = matchEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
    const awayScore = matchEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
    
    return {
      homeScore,
      awayScore,
      events: matchEvents,
      stats: this.calculateMatchStats(matchEvents, matchData),
      powerDifference: homeTotal - awayTotal,
      tacticalAdvantage: tacticalAdvantage,
      weather: matchData.weather,
      day: matchData.day
    };
  }
  
  // チーム力計算
  calculateTeamPower(teamData) {
    const { players, tactics, coach } = teamData;
    
    if (!players.length) return 50; // デフォルト値
    
    // 主力選手選出（フォーメーションに基づく）
    const startingEleven = this.selectStartingEleven(players, tactics.formation);
    
    // 選手能力の平均
    const avgPlayerPower = startingEleven.reduce((sum, player) => {
      return sum + PlayerUtils.calculatePlayerPower(player);
    }, 0) / startingEleven.length;
    
    // 監督効果
    const coachBonus = coach ? this.calculateCoachBonus(coach, tactics) : 1.0;
    
    // 戦術効果
    const tacticalBonus = this.calculateTacticalBonus(tactics, startingEleven);
    
    // チーム連携度（仮想値）
    const teamChemistry = this.calculateTeamChemistry(startingEleven, coach);
    
    return Math.max(30, Math.min(95, avgPlayerPower * coachBonus * tacticalBonus * teamChemistry));
  }
  
  // スターティングイレブン選出
  selectStartingEleven(players, formation) {
    const formations = {
      1: { GK: 1, DF: 4, MF: 4, FW: 2 }, // 4-4-2
      2: { GK: 1, DF: 4, MF: 3, FW: 3 }, // 4-3-3
      3: { GK: 1, DF: 3, MF: 5, FW: 2 }, // 3-5-2
      4: { GK: 1, DF: 5, MF: 3, FW: 2 }, // 5-3-2
      5: { GK: 1, DF: 4, MF: 5, FW: 1 }, // 4-5-1
      6: { GK: 1, DF: 3, MF: 4, FW: 3 }, // 3-4-3
      7: { GK: 1, DF: 4, MF: 2, FW: 4 }, // 4-2-3-1
      8: { GK: 1, DF: 3, MF: 6, FW: 1 }, // 3-6-1
      9: { GK: 1, DF: 5, MF: 4, FW: 1 }, // 5-4-1
      10: { GK: 1, DF: 4, MF: 1, FW: 5 }, // 4-1-4-1
      11: { GK: 1, DF: 3, MF: 3, FW: 4 }, // 3-3-4
      12: { GK: 1, DF: 5, MF: 2, FW: 3 }  // 5-2-3
    };
    
    const formationData = formations[formation] || formations[1];
    const startingEleven = [];
    
    // ポジション別に最適な選手を選出
    Object.entries(formationData).forEach(([position, count]) => {
      const positionPlayers = players
        .filter(p => p.position === position)
        .sort((a, b) => PlayerUtils.calculatePlayerPower(b) - PlayerUtils.calculatePlayerPower(a));
      
      const selected = positionPlayers.slice(0, count);
      startingEleven.push(...selected);
    });
    
    return startingEleven;
  }
  
  // 監督ボーナス計算
  calculateCoachBonus(coach, tactics) {
    if (!coach) return 1.0;
    
    let bonus = 1.0;
    
    // 監督の総合力
    const coachPower = coach.abilities.reduce((sum, ability) => sum + ability, 0);
    bonus += (coachPower - 24) * 0.01; // 24が平均値
    
    // 戦術適性
    const compatibleTactics = CoachUtils.getCompatibleTactics(coach);
    if (compatibleTactics.formations.includes(tactics.formation)) {
      bonus += 0.05;
    }
    if (compatibleTactics.attacks.includes(tactics.attack)) {
      bonus += 0.03;
    }
    if (compatibleTactics.defenses.includes(tactics.defense)) {
      bonus += 0.03;
    }
    
    return Math.max(0.8, Math.min(1.3, bonus));
  }
  
  // 戦術ボーナス計算
  calculateTacticalBonus(tactics, players) {
    let bonus = 1.0;
    
    // フォーメーションと選手適性
    const avgSpeed = players.reduce((sum, p) => sum + p.abilities[0], 0) / players.length;
    const avgPower = players.reduce((sum, p) => sum + p.abilities[1], 0) / players.length;
    const avgTechnique = players.reduce((sum, p) => sum + p.abilities[2], 0) / players.length;
    
    // 攻撃戦術に基づくボーナス
    switch (tactics.attack) {
      case 1: // 速攻
        bonus += (avgSpeed - 70) * 0.002;
        break;
      case 2: // バランス
        bonus += ((avgSpeed + avgTechnique) / 2 - 70) * 0.001;
        break;
      case 3: // ポゼッション
        bonus += (avgTechnique - 70) * 0.002;
        break;
    }
    
    // 守備戦術に基づくボーナス
    switch (tactics.defense) {
      case 1: // プレス
        bonus += (avgSpeed - 70) * 0.001;
        break;
      case 2: // バランス
        bonus += 0.02; // 安定したボーナス
        break;
      case 3: // リトリート
        bonus += (avgPower - 70) * 0.001;
        break;
    }
    
    return Math.max(0.9, Math.min(1.2, bonus));
  }
  
  // チーム連携度計算
  calculateTeamChemistry(players, coach) {
    let chemistry = 1.0;
    
    // 選手の平均経験値
    const avgExperience = players.reduce((sum, p) => sum + (p.experience || 50), 0) / players.length;
    chemistry += (avgExperience - 50) * 0.003;
    
    // 監督との相性（仮想値）
    if (coach) {
      chemistry += coach.abilities[1] * 0.005; // 共感力
    }
    
    // 選手の年齢バランス
    const avgAge = players.reduce((sum, p) => sum + p.age, 0) / players.length;
    const idealAge = 26;
    const agePenalty = Math.abs(avgAge - idealAge) * 0.01;
    chemistry -= agePenalty;
    
    return Math.max(0.85, Math.min(1.15, chemistry));
  }
  
  // 戦術相性計算
  calculateTacticalAdvantage(homeTactics, awayTactics) {
    const advantages = {
      // フォーメーション相性（簡略化）
      formation: this.getFormationAdvantage(homeTactics.formation, awayTactics.formation),
      // 攻守相性
      attackDefense: this.getAttackDefenseAdvantage(
        homeTactics.attack, awayTactics.defense,
        homeTactics.defense, awayTactics.attack
      )
    };
    
    return {
      home: 1.0 + (advantages.formation.home + advantages.attackDefense.home) * 0.1,
      away: 1.0 + (advantages.formation.away + advantages.attackDefense.away) * 0.1
    };
  }
  
  // フォーメーション相性
  getFormationAdvantage(homeFormation, awayFormation) {
    // 簡略化された相性表
    const advantages = {
      1: { strong: [3, 6], weak: [4, 9] }, // 4-4-2
      2: { strong: [1, 5], weak: [3, 8] }, // 4-3-3
      3: { strong: [4, 7], weak: [1, 2] }, // 3-5-2
      4: { strong: [1, 2], weak: [6, 11] }, // 5-3-2
      5: { strong: [8, 9], weak: [2, 6] }, // 4-5-1
      6: { strong: [4, 5], weak: [1, 9] }, // 3-4-3
      7: { strong: [3, 8], weak: [4, 5] }, // 4-2-3-1
      8: { strong: [2, 6], weak: [7, 11] }, // 3-6-1
      9: { strong: [6, 11], weak: [1, 5] }, // 5-4-1
      10: { strong: [5, 8], weak: [3, 7] }, // 4-1-4-1
      11: { strong: [8, 9], weak: [4, 12] }, // 3-3-4
      12: { strong: [11, 7], weak: [2, 6] }  // 5-2-3
    };
    
    const homeData = advantages[homeFormation] || { strong: [], weak: [] };
    const awayData = advantages[awayFormation] || { strong: [], weak: [] };
    
    let homeAdvantage = 0;
    let awayAdvantage = 0;
    
    if (homeData.strong.includes(awayFormation)) homeAdvantage += 0.5;
    if (homeData.weak.includes(awayFormation)) homeAdvantage -= 0.5;
    if (awayData.strong.includes(homeFormation)) awayAdvantage += 0.5;
    if (awayData.weak.includes(homeFormation)) awayAdvantage -= 0.5;
    
    return { home: homeAdvantage, away: awayAdvantage };
  }
  
  // 攻守相性
  getAttackDefenseAdvantage(homeAttack, awayDefense, homeDefense, awayAttack) {
    const matchups = {
      1: { strong: [3], weak: [1] }, // 速攻 vs リトリート有利、プレス不利
      2: { strong: [1, 3], weak: [] }, // バランス
      3: { strong: [1], weak: [3] }  // ポゼッション vs プレス有利、リトリート不利
    };
    
    let homeAdvantage = 0;
    let awayAdvantage = 0;
    
    // ホーム攻撃 vs アウェイ守備
    const homeAttackData = matchups[homeAttack];
    if (homeAttackData.strong.includes(awayDefense)) homeAdvantage += 0.3;
    if (homeAttackData.weak.includes(awayDefense)) homeAdvantage -= 0.3;
    
    // アウェイ攻撃 vs ホーム守備
    const awayAttackData = matchups[awayAttack];
    if (awayAttackData.strong.includes(homeDefense)) awayAdvantage += 0.3;
    if (awayAttackData.weak.includes(homeDefense)) awayAdvantage -= 0.3;
    
    return { home: homeAdvantage, away: awayAdvantage };
  }
  
  // 試合イベントシミュレーション
  simulateMatchEvents(homePower, awayPower, matchData) {
    const events = [];
    const totalPower = homePower + awayPower;
    
    // 試合時間は90分、10分刻みで判定
    for (let minute = 10; minute <= 90; minute += 10) {
      // 攻撃機会の判定
      const homeChance = (homePower / totalPower) * 100;
      const awayChance = (awayPower / totalPower) * 100;
      
      // ホーム攻撃判定
      if (this.random.int(1, 100) <= homeChance * 0.3) {
        const event = this.generateAttackEvent('home', minute, matchData);
        if (event) events.push(event);
      }
      
      // アウェイ攻撃判定
      if (this.random.int(1, 100) <= awayChance * 0.3) {
        const event = this.generateAttackEvent('away', minute, matchData);
        if (event) events.push(event);
      }
      
      // その他のイベント（カード、交代など）
      if (this.random.int(1, 100) <= 15) {
        const event = this.generateMiscEvent(minute, matchData);
        if (event) events.push(event);
      }
    }
    
    return events.sort((a, b) => a.minute - b.minute);
  }
  
  // 攻撃イベント生成
  generateAttackEvent(team, minute, matchData) {
    const teamData = matchData[team];
    const opponentData = matchData[team === 'home' ? 'away' : 'home'];
    
    // 攻撃力 vs 守備力
    const attackPower = this.calculateAttackPower(teamData);
    const defensePower = this.calculateDefensePower(opponentData);
    
    const successRate = Math.max(5, Math.min(40, (attackPower / defensePower) * 20));
    
    if (this.random.int(1, 100) <= successRate) {
      // ゴール成功
      const scorer = this.selectScorer(teamData.players);
      return {
        type: 'goal',
        team: team,
        minute: minute,
        player: scorer ? scorer.name : 'Unknown',
        description: this.generateGoalDescription(scorer, teamData.tactics)
      };
    } else if (this.random.int(1, 100) <= 60) {
      // シュート外し
      return {
        type: 'shot',
        team: team,
        minute: minute,
        description: 'シュートを放つもゴールならず'
      };
    }
    
    return null;
  }
  
  // 攻撃力計算
  calculateAttackPower(teamData) {
    const attackers = teamData.players.filter(p => p.position === 'FW' || p.position === 'MF');
    if (!attackers.length) return 50;
    
    const avgAttackAbility = attackers.reduce((sum, p) => {
      return sum + (p.abilities[0] + p.abilities[2]) / 2; // スピード + テクニック
    }, 0) / attackers.length;
    
    // 戦術ボーナス
    let tacticalBonus = 1.0;
    switch (teamData.tactics.attack) {
      case 1: tacticalBonus = 1.1; break; // 速攻
      case 3: tacticalBonus = 1.05; break; // ポゼッション
    }
    
    return avgAttackAbility * tacticalBonus;
  }
  
  // 守備力計算
  calculateDefensePower(teamData) {
    const defenders = teamData.players.filter(p => p.position === 'DF' || p.position === 'GK');
    if (!defenders.length) return 50;
    
    const avgDefenseAbility = defenders.reduce((sum, p) => {
      return sum + (p.abilities[1] + p.abilities[3]) / 2; // パワー + スタミナ
    }, 0) / defenders.length;
    
    // 戦術ボーナス
    let tacticalBonus = 1.0;
    switch (teamData.tactics.defense) {
      case 1: tacticalBonus = 1.05; break; // プレス
      case 3: tacticalBonus = 1.1; break; // リトリート
    }
    
    return avgDefenseAbility * tacticalBonus;
  }
  
  // 得点者選出
  selectScorer(players) {
    const attackers = players.filter(p => p.position === 'FW');
    const midfielders = players.filter(p => p.position === 'MF');
    
    // 確率重み付け（FW: 60%, MF: 35%, その他: 5%）
    const rand = this.random.int(1, 100);
    
    if (rand <= 60 && attackers.length > 0) {
      return this.random.choice(attackers);
    } else if (rand <= 95 && midfielders.length > 0) {
      return this.random.choice(midfielders);
    } else {
      return this.random.choice(players);
    }
  }
  
  // ゴール説明生成
  generateGoalDescription(scorer, tactics) {
    const descriptions = {
      1: ['カウンターアタックから', 'スピードを活かして', '素早い攻撃で'], // 速攻
      2: ['チャンスをうかがい', 'バランスよく攻め', '着実に攻撃を重ね'], // バランス
      3: ['丁寧なパス回しから', 'ボールをキープして', 'じっくりと攻め'] // ポゼッション
    };
    
    const tacticalDesc = this.random.choice(descriptions[tactics.attack] || descriptions[2]);
    const actions = ['ゴールを決める！', 'ネットを揺らす！', '見事なゴール！', '決定的なシュート！'];
    const action = this.random.choice(actions);
    
    return `${tacticalDesc}${action}`;
  }
  
  // その他イベント生成
  generateMiscEvent(minute, matchData) {
    const eventTypes = ['yellow_card', 'corner', 'free_kick', 'offside'];
    const eventType = this.random.choice(eventTypes);
    const team = this.random.choice(['home', 'away']);
    
    switch (eventType) {
      case 'yellow_card':
        const player = this.random.choice(matchData[team].players);
        return {
          type: 'yellow_card',
          team: team,
          minute: minute,
          player: player.name,
          description: 'イエローカードが出される'
        };
      case 'corner':
        return {
          type: 'corner',
          team: team,
          minute: minute,
          description: 'コーナーキックを獲得'
        };
      default:
        return null;
    }
  }
  
  // 試合統計計算
  calculateMatchStats(events, matchData) {
    const homeShots = events.filter(e => e.team === 'home' && (e.type === 'goal' || e.type === 'shot')).length;
    const awayShots = events.filter(e => e.team === 'away' && (e.type === 'goal' || e.type === 'shot')).length;
    const homeCards = events.filter(e => e.team === 'home' && e.type === 'yellow_card').length;
    const awayCards = events.filter(e => e.team === 'away' && e.type === 'yellow_card').length;
    
    return {
      shots: { home: homeShots, away: awayShots },
      cards: { home: homeCards, away: awayCards },
      possession: { home: 50, away: 50 }, // 仮値
      corners: {
        home: events.filter(e => e.team === 'home' && e.type === 'corner').length,
        away: events.filter(e => e.team === 'away' && e.type === 'corner').length
      }
    };
  }
  
  // 結果処理
  processMatchResult(result, homeTeam, awayTeam) {
    // スタッツ更新
    this.updateTeamStats(homeTeam, result.homeScore, result.awayScore);
    this.updateTeamStats(awayTeam, result.awayScore, result.homeScore);
    
    // 選手統計更新
    this.updatePlayerStats(result.events, homeTeam, awayTeam);
  }
  
  // チーム統計更新
  updateTeamStats(team, goalsFor, goalsAgainst) {
    if (!team.stats) {
      team.stats = { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    }
    
    team.stats.goalsFor += goalsFor;
    team.stats.goalsAgainst += goalsAgainst;
    
    if (goalsFor > goalsAgainst) {
      team.stats.wins++;
      team.stats.points += 3;
    } else if (goalsFor === goalsAgainst) {
      team.stats.draws++;
      team.stats.points += 1;
    } else {
      team.stats.losses++;
    }
  }
  
  // 選手統計更新
  updatePlayerStats(events, homeTeam, awayTeam) {
    events.forEach(event => {
      if (event.type === 'goal' && event.player) {
        const team = event.team === 'home' ? homeTeam : awayTeam;
        const player = team.players.find(p => p.name === event.player);
        
        if (player) {
          player.totalGoals = (player.totalGoals || 0) + 1;
        }
      }
    });
    
    // 全選手の試合数を増加
    [...homeTeam.players, ...awayTeam.players].forEach(player => {
      player.totalGames = (player.totalGames || 0) + 1;
    });
  }
  
  // 天気生成
  generateWeather() {
    const weathers = [
      { type: 'sunny', name: '晴れ', effect: 1.0 },
      { type: 'cloudy', name: '曇り', effect: 1.0 },
      { type: 'rainy', name: '雨', effect: 0.95 },
      { type: 'windy', name: '強風', effect: 0.98 }
    ];
    
    return this.random.choice(weathers);
  }
  
  // 審判生成
  generateReferee() {
    const referees = [
      { name: '厳格な審判', cardRate: 1.2 },
      { name: '寛容な審判', cardRate: 0.8 },
      { name: '普通の審判', cardRate: 1.0 }
    ];
    
    return this.random.choice(referees);
  }
  
  // フォールバック結果生成
  generateFallbackResult(homeTeam, awayTeam, day) {
    const homeScore = this.random.int(0, 4);
    const awayScore = this.random.int(0, 4);
    
    return {
      homeScore,
      awayScore,
      events: [],
      stats: {
        shots: { home: homeScore + this.random.int(2, 8), away: awayScore + this.random.int(2, 8) },
        cards: { home: this.random.int(0, 3), away: this.random.int(0, 3) },
        possession: { home: this.random.int(40, 60), away: this.random.int(40, 60) },
        corners: { home: this.random.int(2, 8), away: this.random.int(2, 8) }
      },
      powerDifference: 0,
      tacticalAdvantage: { home: 1.0, away: 1.0 },
      weather: this.generateWeather(),
      day: day,
      fallback: true
    };
  }
}

// グローバルインスタンス
const matchEngine = new MatchEngine();

// デバッグ用
if (DEBUG) {
  console.log('Match Engine initialized');
  
  // テスト用関数
  window.testMatch = () => {
    const testTeam1 = {
      name: 'テストチーム1',
      players: PlayerGenerator.generateTeamPlayers(1000000000, 'balanced'),
      tactics: { formation: 1, attack: 1, defense: 1 },
      coach: CoachUtils.getRandomCoach(200000000),
      stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    };
    
    const testTeam2 = {
      name: 'テストチーム2',
      players: PlayerGenerator.generateTeamPlayers(1000000000, 'balanced'),
      tactics: { formation: 2, attack: 2, defense: 2 },
      coach: CoachUtils.getRandomCoach(200000000),
      stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    };
    
    const result = matchEngine.simulateMatch(testTeam1, testTeam2, 1);
    console.log('Test match result:', result);
    return result;
  };
}