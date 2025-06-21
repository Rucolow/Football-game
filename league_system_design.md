# リーグ戦システム設計

## 📅 シーズンスケジュール

### 基本構造
```
18チーム × ホーム&アウェイ = 34節
1日2試合自動進行 = 17日でリーグ戦終了
優勝決定戦: 上位3チーム × 3日間
総期間: 20日でワンシーズン完了
```

### 日程システム
```javascript
function generateLeagueSchedule(teams) {
    const schedule = [];
    const teamCount = teams.length; // 18チーム
    
    // ホーム&アウェイの総当たり戦
    for (let round = 1; round <= (teamCount - 1) * 2; round++) {
        const matchDay = Math.ceil(round / 2);
        const isSecondLeg = round > (teamCount - 1);
        
        const dayMatches = [];
        
        // 各ラウンドの対戦カード生成
        for (let i = 0; i < teamCount / 2; i++) {
            const home = getTeamForRound(round, i, teamCount, isSecondLeg);
            const away = getTeamForRound(round, i + teamCount / 2, teamCount, isSecondLeg);
            
            dayMatches.push({
                home: teams[home],
                away: teams[away],
                matchDay: matchDay,
                round: round,
                isSecondLeg: isSecondLeg
            });
        }
        
        schedule.push({
            day: matchDay,
            matches: dayMatches
        });
    }
    
    return schedule;
}
```

## 📊 順位計算システム

### ポイント計算
```javascript
function calculateLeagueStandings(teams, matchResults) {
    const standings = teams.map(team => ({
        team: team,
        points: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        matches: 0
    }));
    
    // 試合結果を集計
    matchResults.forEach(match => {
        const homeTeam = standings.find(s => s.team.id === match.home.id);
        const awayTeam = standings.find(s => s.team.id === match.away.id);
        
        homeTeam.matches++;
        awayTeam.matches++;
        homeTeam.goalsFor += match.homeScore;
        homeTeam.goalsAgainst += match.awayScore;
        awayTeam.goalsFor += match.awayScore;
        awayTeam.goalsAgainst += match.homeScore;
        
        // 勝敗判定
        if (match.homeScore > match.awayScore) {
            // ホーム勝利
            homeTeam.wins++;
            homeTeam.points += 3;
            awayTeam.losses++;
        } else if (match.homeScore < match.awayScore) {
            // アウェイ勝利
            awayTeam.wins++;
            awayTeam.points += 3;
            homeTeam.losses++;
        } else {
            // 引き分け
            homeTeam.draws++;
            awayTeam.draws++;
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
        
        // 得失点差計算
        homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst;
        awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst;
    });
    
    // 順位ソート
    standings.sort((a, b) => {
        // 1. ポイント数
        if (a.points !== b.points) return b.points - a.points;
        // 2. 得失点差
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        // 3. 総得点
        if (a.goalsFor !== b.goalsFor) return b.goalsFor - a.goalsFor;
        // 4. 直接対戦成績（簡略化のため省略）
        return 0;
    });
    
    // 順位付け
    standings.forEach((team, index) => {
        team.position = index + 1;
    });
    
    return standings;
}
```

## 🏆 優勝決定戦システム

### 上位3チーム決定戦
```javascript
function generateChampionshipTournament(topThreeTeams) {
    const tournament = {
        teams: topThreeTeams,
        matches: [],
        finalStandings: []
    };
    
    // 3チーム総当たり戦（ホーム&アウェイ）
    const matchups = [
        { home: 0, away: 1 }, // 1位 vs 2位
        { home: 1, away: 2 }, // 2位 vs 3位  
        { home: 2, away: 0 }, // 3位 vs 1位
        { home: 1, away: 0 }, // 2位 vs 1位（アウェイ）
        { home: 2, away: 1 }, // 3位 vs 2位（アウェイ）
        { home: 0, away: 2 }  // 1位 vs 3位（アウェイ）
    ];
    
    matchups.forEach((matchup, index) => {
        tournament.matches.push({
            day: Math.floor(index / 2) + 1, // 3日間
            home: topThreeTeams[matchup.home],
            away: topThreeTeams[matchup.away],
            isChampionship: true
        });
    });
    
    return tournament;
}

function calculateChampionshipWinner(tournamentResults) {
    const teams = tournamentResults.teams;
    const standings = teams.map(team => ({
        team: team,
        points: 0,
        goalDifference: 0,
        goalsFor: 0
    }));
    
    // 優勝決定戦の結果を集計
    tournamentResults.matches.forEach(match => {
        const homeTeam = standings.find(s => s.team.id === match.home.id);
        const awayTeam = standings.find(s => s.team.id === match.away.id);
        
        homeTeam.goalsFor += match.homeScore;
        homeTeam.goalDifference += (match.homeScore - match.awayScore);
        awayTeam.goalsFor += match.awayScore;
        awayTeam.goalDifference += (match.awayScore - match.homeScore);
        
        if (match.homeScore > match.awayScore) {
            homeTeam.points += 3;
        } else if (match.homeScore < match.awayScore) {
            awayTeam.points += 3;
        } else {
            homeTeam.points += 1;
            awayTeam.points += 1;
        }
    });
    
    // 優勝決定戦順位決定
    standings.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
    });
    
    return {
        champion: standings[0].team,
        runnerUp: standings[1].team,
        third: standings[2].team,
        results: standings
    };
}
```

## 📺 他チーム情報表示システム

### チーム詳細表示
```javascript
function getTeamDetailedInfo(team, includePrivate = false) {
    const publicInfo = {
        basic: {
            name: team.name,
            rank: team.currentRank,
            points: team.points,
            wins: team.wins,
            draws: team.draws,
            losses: team.losses,
            goalDifference: team.goalDifference
        },
        
        style: {
            preferredFormation: getMostUsedFormation(team),
            preferredAttack: getMostUsedAttack(team),
            preferredDefense: getMostUsedDefense(team),
            playStyle: analyzePlayStyle(team)
        },
        
        recent: {
            lastFiveResults: getRecentResults(team, 5),
            form: calculateForm(team),
            streak: getCurrentStreak(team)
        },
        
        stats: {
            averageGoalsFor: team.goalsFor / team.matches,
            averageGoalsAgainst: team.goalsAgainst / team.matches,
            cleanSheets: team.cleanSheets,
            bigWins: team.bigWins // 3点差以上の勝利
        }
    };
    
    // プライベート情報（詳細分析）
    if (includePrivate) {
        publicInfo.detailed = {
            coach: {
                name: team.coach.name,
                type: team.coach.type,
                experience: team.coach.experience
            },
            
            keyPlayers: identifyKeyPlayers(team),
            
            strengths: analyzeTeamStrengths(team),
            weaknesses: analyzeTeamWeaknesses(team),
            
            tacticalTendencies: analyzeTacticalPatterns(team),
            
            injuries: team.players.filter(p => p.isInjured).map(p => ({
                name: p.name,
                position: p.position,
                matchesRemaining: p.injuryData.matchesBanned
            }))
        };
    }
    
    return publicInfo;
}
```

### リーグ全体状況表示
```javascript
function getLeagueOverview(league) {
    return {
        standings: league.standings.map((team, index) => ({
            position: index + 1,
            team: team.team.name,
            points: team.points,
            matches: team.matches,
            goalDifference: team.goalDifference,
            form: getLastFiveForm(team.team),
            change: getPositionChange(team.team) // 前節との順位変動
        })),
        
        upcomingMatches: getUpcomingMatches(league),
        
        todayResults: getTodayResults(league),
        
        statistics: {
            topScorer: getTopScorer(league),
            bestDefense: getBestDefense(league),
            mostWins: getMostWins(league),
            surprise: getSurpriseTeam(league) // 期待を上回るチーム
        },
        
        championship: {
            contenders: getChampionshipContenders(league),
            relegationBattle: getRelegationBattle(league),
            mathematicalStatus: getMathematicalStatus(league)
        }
    };
}
```

## 🔄 他チーム間試合処理

### 自動試合進行
```javascript
function processAllMatches(matchDay, userTeam) {
    const results = [];
    
    matchDay.matches.forEach(match => {
        let result;
        
        if (match.home.id === userTeam.id || match.away.id === userTeam.id) {
            // ユーザーチームの試合は詳細処理
            result = simulateDetailedMatch(match.home, match.away);
        } else {
            // 他チーム間の試合は簡略処理
            result = simulateQuickMatch(match.home, match.away);
        }
        
        results.push({
            ...match,
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            events: result.events || [],
            attendance: calculateAttendance(match),
            isUserMatch: match.home.id === userTeam.id || match.away.id === userTeam.id
        });
    });
    
    return results;
}

function simulateQuickMatch(homeTeam, awayTeam) {
    // 簡略化された試合計算
    const homePower = calculateTeamPower(homeTeam);
    const awayPower = calculateTeamPower(awayTeam);
    
    // ホームアドバンテージ
    const adjustedHomePower = homePower * 1.1;
    
    // 戦術相性
    const tacticalAdvantage = calculateTacticalAdvantage(homeTeam, awayTeam);
    
    // 得点期待値計算
    const homeExpected = calculateExpectedGoals(
        adjustedHomePower * tacticalAdvantage.teamA.overall, 
        awayPower
    );
    const awayExpected = calculateExpectedGoals(
        awayPower * tacticalAdvantage.teamB.overall, 
        adjustedHomePower
    );
    
    // 実際の得点生成
    const homeScore = generateActualGoals(homeExpected, homeTeam.averageLuck);
    const awayScore = generateActualGoals(awayExpected, awayTeam.averageLuck);
    
    return {
        homeScore: homeScore,
        awayScore: awayScore,
        homeExpected: homeExpected.toFixed(1),
        awayExpected: awayExpected.toFixed(1)
    };
}
```

### 結果閲覧システム
```javascript
function formatMatchResults(results, userTeamId) {
    return results.map(match => {
        const isUserMatch = match.home.id === userTeamId || match.away.id === userTeamId;
        
        return {
            display: {
                homeTeam: match.home.name,
                awayTeam: match.away.name,
                score: `${match.homeScore} - ${match.awayScore}`,
                result: getMatchResult(match),
                isUserMatch: isUserMatch,
                importance: getMatchImportance(match),
                attendance: match.attendance?.toLocaleString() || 'N/A'
            },
            
            details: isUserMatch ? {
                events: match.events,
                tactics: {
                    home: match.home.currentTactics,
                    away: match.away.currentTactics
                },
                playerRatings: match.playerRatings
            } : {
                summary: `${match.home.name}が${getMatchSummary(match)}`
            }
        };
    });
}
```

## 📱 UI表示例

### リーグ順位表
```
📊 リーグ順位表 (第12節終了)

1位 王者FC        33pt (+18) 🔥🔥🔥🔥🔥
2位 我がチーム    30pt (+12) 🔥🔥🔥🔵🔵 ↑2
3位 テクニカル    28pt (+8)  🔥🔥🔵🔵🔵 ↓1
4位 バランサーズ  25pt (+5)  🔵🔥🔥🔵🔵
...
18位 新興FC       8pt (-15)  🔴🔴🔴🔴🔴

🔥勝利 🔵引分 🔴敗北 (直近5試合)
```

### 今日の結果
```
⚽ 第12節結果

🏆 注目の一戦
我がチーム 2-1 ライバルFC ✨
📺 [詳細を見る]

📋 その他の結果
王者FC 3-0 弱小FC
テクニカル 1-1 バランサーズ
スピード 2-2 サイド
...

📈 順位変動
↗️ 我がチーム (4位→2位)
↘️ ライバルFC (2位→4位)
```

---

*「18チームが織りなす、ドラマチックなリーグ戦」*