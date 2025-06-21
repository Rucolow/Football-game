/* ========================================
   リーグマネージャー - 12チームリーグシステム
======================================== */

class LeagueManager {
  constructor() {
    this.version = '1.0.0';
    this.debug = DEBUG;
    this.maxTeams = 12;
    this.maxDays = 22; // 11試合 × 2 (ホーム&アウェイ)
  }
  
  // リーグ初期化
  initializeLeague(playerTeam, season = 1) {
    try {
      log.info(`Initializing league for season ${season}`);
      
      const league = {
        season: season,
        day: 1,
        maxDay: this.maxDays,
        phase: 'regular', // regular, playoff, finished
        teams: [],
        matches: [],
        standings: [],
        playerTeamId: null,
        npcTeams: [],
        schedule: [],
        leagueStats: {
          totalGoals: 0,
          totalMatches: 0,
          avgGoalsPerMatch: 0
        }
      };
      
      // プレイヤーチーム追加
      if (playerTeam) {
        playerTeam.id = 'player_team';
        playerTeam.isPlayer = true;
        playerTeam.name = playerTeam.name || 'マイチーム';
        league.teams.push(playerTeam);
        league.playerTeamId = 'player_team';
      }
      
      // NPCチーム生成
      const npcTeams = this.generateNPCTeams(this.maxTeams - 1);
      league.teams.push(...npcTeams);
      league.npcTeams = npcTeams;
      
      // 試合スケジュール生成
      league.schedule = this.generateSchedule(league.teams);
      
      // 初期順位表作成
      league.standings = this.calculateStandings(league.teams);
      
      log.info(`League initialized with ${league.teams.length} teams`);
      return league;
      
    } catch (error) {
      log.error('League initialization failed', error);
      return this.createFallbackLeague(playerTeam, season);
    }
  }
  
  // NPCチーム生成
  generateNPCTeams(count) {
    const npcTeams = [];
    const teamNames = this.getNPCTeamNames();
    const teamTypes = ['balanced', 'offensive', 'defensive', 'youth', 'experienced'];
    
    for (let i = 0; i < count; i++) {
      const teamName = teamNames[i] || `NPCチーム${i + 1}`;
      const teamType = random.choice(teamTypes);
      const budget = this.generateNPCBudget();
      
      const team = teamBuilder.buildAutoTeam(budget, teamType);
      team.id = `npc_team_${i + 1}`;
      team.name = teamName;
      team.isPlayer = false;
      team.teamType = teamType;
      team.aiLevel = this.generateAILevel();
      team.reputation = this.generateReputation();
      
      // NPCチーム特性追加
      team.characteristics = this.generateTeamCharacteristics(teamType);
      
      npcTeams.push(team);
    }
    
    return npcTeams;
  }
  
  // NPCチーム名生成
  getNPCTeamNames() {
    return [
      '東京フェニックス',
      '横浜マリナーズ',
      '大阪サンダー',
      '名古屋ドラゴンズ',
      '福岡ホークス',
      '仙台イーグルス',
      '神戸ヴィクトリー',
      '埼玉ライオンズ',
      '千葉ジェッツ',
      '広島カープス',
      '札幌ファイターズ'
    ];
  }
  
  // NPC予算生成
  generateNPCBudget() {
    // 予算幅: 20億～35億KR
    const budgetTypes = [
      { min: 2000000000, max: 2500000000, weight: 3 }, // 弱小
      { min: 2500000000, max: 3000000000, weight: 4 }, // 中堅
      { min: 3000000000, max: 3500000000, weight: 3 }  // 強豪
    ];
    
    const selectedType = random.weightedChoice(budgetTypes);
    return random.int(selectedType.min, selectedType.max);
  }
  
  // AIレベル生成
  generateAILevel() {
    // 1-10のレベル (高いほど強い戦術判断)
    const levels = [
      { level: random.int(3, 5), weight: 3 }, // 弱小AI
      { level: random.int(5, 7), weight: 4 }, // 標準AI
      { level: random.int(7, 10), weight: 3 } // 強豪AI
    ];
    
    return random.weightedChoice(levels).level;
  }
  
  // チーム評判生成
  generateReputation() {
    return random.int(30, 90); // 30-90の評判値
  }
  
  // チーム特性生成
  generateTeamCharacteristics(teamType) {
    const baseCharacteristics = {
      aggression: random.int(40, 80),      // 攻撃性
      discipline: random.int(40, 80),      // 規律
      consistency: random.int(40, 80),     // 安定性
      morale: random.int(60, 100),         // チームモラール
      fanSupport: random.int(30, 90),      // ファンサポート
      marketValue: random.int(50, 120)     // 市場価値指数
    };
    
    // チームタイプによる調整
    switch (teamType) {
      case 'offensive':
        baseCharacteristics.aggression += 15;
        baseCharacteristics.discipline -= 10;
        break;
      case 'defensive':
        baseCharacteristics.discipline += 15;
        baseCharacteristics.aggression -= 10;
        break;
      case 'youth':
        baseCharacteristics.morale += 10;
        baseCharacteristics.consistency -= 15;
        break;
      case 'experienced':
        baseCharacteristics.consistency += 15;
        baseCharacteristics.morale -= 5;
        break;
    }
    
    // 値の正規化
    Object.keys(baseCharacteristics).forEach(key => {
      baseCharacteristics[key] = Math.max(0, Math.min(100, baseCharacteristics[key]));
    });
    
    return baseCharacteristics;
  }
  
  // 試合スケジュール生成
  generateSchedule(teams) {
    const schedule = [];
    const numTeams = teams.length;
    
    if (numTeams % 2 !== 0) {
      log.warn('Odd number of teams, adding bye');
      teams = [...teams, { id: 'bye', name: 'BYE', isBye: true }];
    }
    
    const totalRounds = (teams.length - 1) * 2; // ホーム&アウェイ
    
    for (let round = 1; round <= totalRounds; round++) {
      const roundMatches = this.generateRoundMatches(teams, round);
      schedule.push({
        day: round,
        matches: roundMatches.filter(match => !match.home.isBye && !match.away.isBye)
      });
    }
    
    return schedule;
  }
  
  // ラウンド試合生成
  generateRoundMatches(teams, round) {
    const matches = [];
    const numTeams = teams.length;
    const isSecondLeg = round > (numTeams - 1);
    const actualRound = isSecondLeg ? round - (numTeams - 1) : round;
    
    for (let i = 0; i < numTeams / 2; i++) {
      let homeIndex, awayIndex;
      
      if (i === 0) {
        homeIndex = 0;
        awayIndex = actualRound;
      } else {
        homeIndex = (actualRound - i + numTeams - 1) % (numTeams - 1) + 1;
        awayIndex = (actualRound + i - 1) % (numTeams - 1) + 1;
      }
      
      if (awayIndex === 0) awayIndex = numTeams - 1;
      
      // セカンドレグではホーム・アウェイを入れ替え
      if (isSecondLeg) {
        [homeIndex, awayIndex] = [awayIndex, homeIndex];
      }
      
      const homeTeam = teams[homeIndex];
      const awayTeam = teams[awayIndex];
      
      if (homeTeam && awayTeam) {
        matches.push({
          id: `match_${round}_${i}`,
          day: round,
          home: { id: homeTeam.id, name: homeTeam.name },
          away: { id: awayTeam.id, name: awayTeam.name },
          result: null,
          played: false
        });
      }
    }
    
    return matches;
  }
  
  // 節の試合実行
  processMatchDay(league, day) {
    try {
      log.info(`Processing match day ${day}`);
      
      const daySchedule = league.schedule.find(s => s.day === day);
      if (!daySchedule) {
        log.warn(`No matches scheduled for day ${day}`);
        return { matches: [], standings: league.standings };
      }
      
      const results = [];
      
      // その日の全試合を実行
      for (const match of daySchedule.matches) {
        if (!match.played) {
          const result = this.playMatch(league, match);
          results.push(result);
          
          // 試合結果をリーグに記録
          league.matches.push(result);
          
          // チーム統計更新
          this.updateTeamStats(league, result);
        }
      }
      
      // 順位表更新
      league.standings = this.calculateStandings(league.teams);
      
      // リーグ統計更新
      this.updateLeagueStats(league, results);
      
      // 次の日に進める
      league.day = Math.min(league.maxDay + 1, day + 1);
      
      // シーズン終了チェック
      if (league.day > league.maxDay) {
        league.phase = 'finished';
        this.processSeasonEnd(league);
      }
      
      log.info(`Match day ${day} completed: ${results.length} matches played`);
      
      return {
        matches: results,
        standings: league.standings,
        phase: league.phase
      };
      
    } catch (error) {
      log.error(`Match day ${day} processing failed`, error);
      return { matches: [], standings: league.standings };
    }
  }
  
  // 試合実行
  playMatch(league, match) {
    const homeTeam = league.teams.find(t => t.id === match.home.id);
    const awayTeam = league.teams.find(t => t.id === match.away.id);
    
    if (!homeTeam || !awayTeam) {
      log.error('Team not found for match', match);
      return this.createFallbackMatchResult(match);
    }
    
    // NPCチームの戦術調整
    this.adjustNPCTactics(homeTeam, awayTeam, league);
    
    // 試合シミュレーション
    const result = matchEngine.simulateMatch(homeTeam, awayTeam, match.day);
    
    // 結果にメタデータ追加
    result.id = match.id;
    result.day = match.day;
    result.home = { ...match.home };
    result.away = { ...match.away };
    result.played = true;
    
    // NPCチームの反応シミュレーション
    this.simulateNPCReactions(homeTeam, awayTeam, result);
    
    return result;
  }
  
  // NPCチームの戦術調整
  adjustNPCTactics(homeTeam, awayTeam, league) {
    [homeTeam, awayTeam].forEach(team => {
      if (!team.isPlayer && team.aiLevel) {
        // AIレベルに基づいて戦術を調整
        this.adjustTeamTactics(team, league);
      }
    });
  }
  
  // チーム戦術調整
  adjustTeamTactics(team, league) {
    const aiLevel = team.aiLevel || 5;
    const currentStanding = this.getTeamStanding(team.id, league.standings);
    
    // AIレベルが高いほど状況に応じた戦術変更
    if (aiLevel >= 7 && random.int(1, 100) <= 30) {
      // 順位に基づく戦術変更
      if (currentStanding <= 3) {
        // 上位チームは守備的に
        if (team.tactics.defense < 3) {
          team.tactics.defense = Math.min(3, team.tactics.defense + 1);
        }
      } else if (currentStanding >= 10) {
        // 下位チームは攻撃的に
        if (team.tactics.attack < 3) {
          team.tactics.attack = Math.min(3, team.tactics.attack + 1);
        }
      }
    }
    
    // チーム特性に基づく戦術微調整
    if (team.characteristics) {
      if (team.characteristics.aggression > 70 && random.int(1, 100) <= 20) {
        team.tactics.attack = Math.min(3, team.tactics.attack + 1);
      }
      if (team.characteristics.discipline > 70 && random.int(1, 100) <= 20) {
        team.tactics.defense = Math.min(3, team.tactics.defense + 1);
      }
    }
  }
  
  // NPCチームの反応シミュレーション
  simulateNPCReactions(homeTeam, awayTeam, result) {
    [homeTeam, awayTeam].forEach((team, index) => {
      if (!team.isPlayer && team.characteristics) {
        const isWin = (index === 0 && result.homeScore > result.awayScore) ||
                     (index === 1 && result.awayScore > result.homeScore);
        const isDraw = result.homeScore === result.awayScore;
        
        // モラール調整
        if (isWin) {
          team.characteristics.morale = Math.min(100, team.characteristics.morale + random.int(3, 7));
        } else if (isDraw) {
          team.characteristics.morale += random.int(-2, 2);
        } else {
          team.characteristics.morale = Math.max(0, team.characteristics.morale - random.int(3, 7));
        }
        
        // ファンサポート調整
        if (isWin && (result.homeScore + result.awayScore) >= 3) {
          team.characteristics.fanSupport = Math.min(100, team.characteristics.fanSupport + 1);
        } else if (!isWin && !isDraw) {
          team.characteristics.fanSupport = Math.max(0, team.characteristics.fanSupport - 1);
        }
      }
    });
  }
  
  // チーム統計更新
  updateTeamStats(league, result) {
    const homeTeam = league.teams.find(t => t.id === result.home.id);
    const awayTeam = league.teams.find(t => t.id === result.away.id);
    
    if (homeTeam && awayTeam) {
      this.updateSingleTeamStats(homeTeam, result.homeScore, result.awayScore);
      this.updateSingleTeamStats(awayTeam, result.awayScore, result.homeScore);
    }
  }
  
  // 単一チーム統計更新
  updateSingleTeamStats(team, goalsFor, goalsAgainst) {
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
    
    // 試合数計算
    team.stats.played = team.stats.wins + team.stats.draws + team.stats.losses;
    team.stats.goalDifference = team.stats.goalsFor - team.stats.goalsAgainst;
  }
  
  // 順位表計算
  calculateStandings(teams) {
    return teams
      .filter(team => !team.isBye)
      .map(team => ({
        ...team.stats,
        teamId: team.id,
        teamName: team.name,
        isPlayer: team.isPlayer || false,
        strength: team.strength || 0
      }))
      .sort((a, b) => {
        // 勝点 > 得失点差 > 総得点 > チーム名
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      })
      .map((team, index) => ({
        ...team,
        rank: index + 1
      }));
  }
  
  // チーム順位取得
  getTeamStanding(teamId, standings) {
    const standing = standings.find(s => s.teamId === teamId);
    return standing ? standing.rank : 12;
  }
  
  // リーグ統計更新
  updateLeagueStats(league, matchResults) {
    matchResults.forEach(result => {
      league.leagueStats.totalGoals += result.homeScore + result.awayScore;
      league.leagueStats.totalMatches++;
    });
    
    league.leagueStats.avgGoalsPerMatch = league.leagueStats.totalMatches > 0 ?
      league.leagueStats.totalGoals / league.leagueStats.totalMatches : 0;
  }
  
  // シーズン終了処理
  processSeasonEnd(league) {
    log.info(`Season ${league.season} ended`);
    
    // 最終順位確定
    const finalStandings = this.calculateStandings(league.teams);
    league.finalStandings = finalStandings;
    
    // プレーオフ進出チーム決定
    const playoffTeams = finalStandings.slice(0, 3); // 上位3チーム
    league.playoffTeams = playoffTeams;
    
    // シーズン統計
    league.seasonStats = this.calculateSeasonStats(league);
    
    // NPCチームの成長処理
    this.processNPCGrowth(league);
    
    // 来シーズンに向けた準備
    this.prepareNextSeason(league);
  }
  
  // シーズン統計計算
  calculateSeasonStats(league) {
    const stats = {
      champion: league.finalStandings[0],
      topScorer: this.findTopScorer(league),
      mostGoals: Math.max(...league.teams.map(t => t.stats.goalsFor)),
      bestDefense: Math.min(...league.teams.map(t => t.stats.goalsAgainst)),
      totalMatches: league.leagueStats.totalMatches,
      totalGoals: league.leagueStats.totalGoals,
      avgGoalsPerMatch: league.leagueStats.avgGoalsPerMatch
    };
    
    return stats;
  }
  
  // 得点王検索
  findTopScorer(league) {
    let topScorer = null;
    let maxGoals = 0;
    
    league.teams.forEach(team => {
      if (team.players) {
        team.players.forEach(player => {
          if ((player.totalGoals || 0) > maxGoals) {
            maxGoals = player.totalGoals;
            topScorer = {
              name: player.name,
              team: team.name,
              goals: player.totalGoals
            };
          }
        });
      }
    });
    
    return topScorer;
  }
  
  // NPC成長処理
  processNPCGrowth(league) {
    league.npcTeams.forEach(team => {
      // チーム特性の自然変化
      if (team.characteristics) {
        Object.keys(team.characteristics).forEach(key => {
          const change = random.int(-2, 2);
          team.characteristics[key] = Math.max(0, Math.min(100, team.characteristics[key] + change));
        });
      }
      
      // 成績に基づく調整
      const standing = this.getTeamStanding(team.id, league.finalStandings);
      if (standing <= 3) {
        // 上位チームは評判向上
        team.reputation = Math.min(100, team.reputation + random.int(2, 5));
      } else if (standing >= 10) {
        // 下位チームは評判低下
        team.reputation = Math.max(0, team.reputation - random.int(2, 5));
      }
    });
  }
  
  // 来シーズン準備
  prepareNextSeason(league) {
    // NPCチームの選手成長・移籍シミュレーション
    league.npcTeams.forEach(team => {
      if (team.players) {
        // 簡易成長処理
        const growthResults = growthEngine.processMonthlyGrowth(team, team.coach);
        
        // 移籍シミュレーション（簡易版）
        this.simulateNPCTransfers(team);
      }
    });
  }
  
  // NPC移籍シミュレーション
  simulateNPCTransfers(team) {
    if (!team.players) return;
    
    // 引退選手の処理
    team.players = team.players.filter(player => !player.retired);
    
    // 若干の選手入れ替え（10%程度）
    const transferCount = Math.floor(team.players.length * 0.1);
    for (let i = 0; i < transferCount; i++) {
      if (team.players.length > 11) { // 最低11人は維持
        const oldPlayerIndex = random.int(0, team.players.length - 1);
        const oldPlayer = team.players[oldPlayerIndex];
        
        // 同ポジションの新選手生成
        const newPlayer = PlayerGenerator.generateRandomPlayer('regular', oldPlayer.position);
        team.players[oldPlayerIndex] = newPlayer;
      }
    }
  }
  
  // ユーティリティ関数
  getPlayerTeam(league) {
    return league.teams.find(team => team.isPlayer);
  }
  
  getTeamById(league, teamId) {
    return league.teams.find(team => team.id === teamId);
  }
  
  getCurrentMatches(league) {
    const currentDay = league.day;
    const daySchedule = league.schedule.find(s => s.day === currentDay);
    return daySchedule ? daySchedule.matches : [];
  }
  
  getUpcomingMatches(league, count = 5) {
    const upcomingMatches = [];
    for (let day = league.day; day <= league.maxDay && upcomingMatches.length < count; day++) {
      const daySchedule = league.schedule.find(s => s.day === day);
      if (daySchedule) {
        upcomingMatches.push(...daySchedule.matches);
      }
    }
    return upcomingMatches.slice(0, count);
  }
  
  // フォールバック機能
  createFallbackLeague(playerTeam, season) {
    log.warn('Creating fallback league');
    
    return {
      season: season,
      day: 1,
      maxDay: this.maxDays,
      phase: 'regular',
      teams: playerTeam ? [playerTeam] : [],
      matches: [],
      standings: [],
      playerTeamId: playerTeam ? playerTeam.id : null,
      npcTeams: [],
      schedule: [],
      leagueStats: { totalGoals: 0, totalMatches: 0, avgGoalsPerMatch: 0 }
    };
  }
  
  createFallbackMatchResult(match) {
    return {
      id: match.id,
      day: match.day,
      home: match.home,
      away: match.away,
      homeScore: random.int(0, 3),
      awayScore: random.int(0, 3),
      events: [],
      played: true,
      fallback: true
    };
  }
}

// グローバルインスタンス
const leagueManager = new LeagueManager();

// デバッグ用
if (DEBUG) {
  console.log('League Manager initialized');
  
  // テスト用関数
  window.testLeague = () => {
    const testTeam = teamBuilder.buildAutoTeam(2800000000, 'balanced');
    testTeam.name = 'テストチーム';
    
    const league = leagueManager.initializeLeague(testTeam, 1);
    console.log('Test league:', league);
    
    // 1日目の試合実行
    const day1Results = leagueManager.processMatchDay(league, 1);
    console.log('Day 1 results:', day1Results);
    
    return league;
  };
}