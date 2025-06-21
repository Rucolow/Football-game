/* ========================================
   ゲームエンジン - メインゲームロジック
======================================== */

class GameEngine {
  constructor() {
    this.version = '1.0.0';
    this.gameState = {
      initialized: false,
      currentScreen: 'loading',
      gamePhase: 'menu', // menu, setup, playing, finished
      
      // プレイヤーデータ
      player: {
        id: null,
        name: '',
        teamName: '',
        budget: 2800000000, // 28億KR
        createdAt: null
      },
      
      // チームデータ
      team: {
        coach: null,
        players: [],
        tactics: {
          formation: 1, // 1-12の番号
          attack: 1,    // 1-3の番号
          defense: 1    // 1-3の番号
        },
        stats: {
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        }
      },
      
      // リーグデータ
      league: {
        season: 1,
        day: 1,
        maxDay: 22, // 12チーム×2回戦-2 = 22節
        teams: [],
        matches: [],
        standings: [],
        phase: 'registration' // registration, season, playoff
      },
      
      // ゲーム設定
      settings: {
        sound: true,
        volume: 50,
        animations: true,
        autoSave: true
      }
    };
    
    this.autoSaveInterval = null;
    this.initialized = false;
  }
  
  // ゲーム初期化
  async init() {
    try {
      log.info('Initializing game engine...');
      
      // 保存データの読み込み
      this.loadGameData();
      
      // UI初期化
      if (typeof ui !== 'undefined') {
        ui.init(this);
      }
      
      // 自動保存開始
      this.startAutoSave();
      
      // 初期画面表示
      this.showScreen('main-menu');
      
      this.initialized = true;
      this.gameState.initialized = true;
      
      log.info('Game engine initialized successfully');
      
    } catch (error) {
      log.error('Failed to initialize game engine', error);
      notify.error('ゲームの初期化に失敗しました');
    }
  }
  
  // 画面切り替え
  showScreen(screenId) {
    // 現在のアクティブ画面を非表示
    const currentActive = dom.get('.screen.active');
    if (currentActive) {
      dom.removeClass(currentActive, 'active');
    }
    
    // 新しい画面を表示
    const newScreen = dom.get(`#${screenId}`);
    if (newScreen) {
      dom.addClass(newScreen, 'active');
      this.gameState.currentScreen = screenId;
      
      // 画面固有の初期化処理
      this.onScreenChanged(screenId);
      
      log.info(`Screen changed to: ${screenId}`);
    } else {
      log.error(`Screen not found: ${screenId}`);
    }
  }
  
  // 画面変更時の処理
  onScreenChanged(screenId) {
    switch (screenId) {
      case 'main-menu':
        this.updateMainMenu();
        break;
      case 'team-setup':
        this.updateTeamSetup();
        break;
      case 'game-main':
        this.updateGameMain();
        this.showBottomNav();
        break;
      default:
        this.hideBottomNav();
    }
  }
  
  // メインメニュー更新
  updateMainMenu() {
    const continueBtn = dom.get('#continue-btn');
    const savedGame = storage.get('gameData');
    
    if (savedGame && savedGame.player && savedGame.player.name) {
      dom.show(continueBtn);
    } else {
      dom.hide(continueBtn);
    }
  }
  
  // チーム設定画面更新
  updateTeamSetup() {
    // チーム名・監督名の初期値設定
    const teamNameInput = dom.get('#team-name');
    const managerNameInput = dom.get('#manager-name');
    
    if (this.gameState.player.teamName) {
      teamNameInput.value = this.gameState.player.teamName;
    }
    if (this.gameState.player.name) {
      managerNameInput.value = this.gameState.player.name;
    }
  }
  
  // ゲームメイン画面更新
  updateGameMain() {
    // チーム名表示
    const teamNameEl = dom.get('#current-team-name');
    if (teamNameEl) {
      teamNameEl.textContent = this.gameState.player.teamName || 'チーム名FC';
    }
    
    // シーズン・節表示
    const seasonEl = dom.get('#current-season');
    if (seasonEl) {
      seasonEl.textContent = `シーズン${this.gameState.league.season} - 第${this.gameState.league.day}節`;
    }
    
    // 順位表示
    this.updateCurrentRank();
    
    // 次の対戦相手表示
    this.updateNextOpponent();
  }
  
  // 現在順位更新
  updateCurrentRank() {
    const rankEl = dom.get('#current-rank');
    if (rankEl) {
      const playerTeam = this.getPlayerTeam();
      if (playerTeam) {
        const rank = this.getTeamRank(playerTeam.id);
        rankEl.textContent = `${rank}位`;
      } else {
        rankEl.textContent = '-位';
      }
    }
  }
  
  // 次の対戦相手更新
  updateNextOpponent() {
    const opponentEl = dom.get('#next-opponent');
    if (opponentEl) {
      const nextMatch = this.getNextMatch();
      if (nextMatch) {
        opponentEl.textContent = nextMatch.opponent.name;
      } else {
        opponentEl.textContent = '試合なし';
      }
    }
  }
  
  // ボトムナビ表示
  showBottomNav() {
    const bottomNav = dom.get('#bottom-nav');
    if (bottomNav) {
      bottomNav.style.display = 'flex';
    }
  }
  
  // ボトムナビ非表示
  hideBottomNav() {
    const bottomNav = dom.get('#bottom-nav');
    if (bottomNav) {
      bottomNav.style.display = 'none';
    }
  }
  
  // チーム設定表示
  showTeamSetup() {
    this.gameState.gamePhase = 'setup';
    this.showScreen('team-setup');
  }
  
  // 設定画面表示
  showSettings() {
    this.showScreen('settings');
  }
  
  // ゲームについて表示
  showAbout() {
    const aboutText = `
      <h3>⚽ サッカーマネージャーゲーム v${this.version}</h3>
      <p>完全無料のサッカーマネージメントゲーム</p>
      <br>
      <p><strong>特徴:</strong></p>
      <ul>
        <li>12人リーグでマルチプレイ対応</li>
        <li>108通りの戦術組み合わせ</li>
        <li>選手成長・覚醒システム</li>
        <li>PWA対応でオフラインプレイ</li>
      </ul>
      <br>
      <p>GitHub: <a href="https://github.com/your-repo">オープンソース</a></p>
    `;
    
    const overlay = dom.create('div', {
      className: 'about-overlay',
      style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1rem;'
    });
    
    const dialog = dom.create('div', {
      className: 'about-dialog',
      style: 'background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 100%; max-height: 80vh; overflow-y: auto;'
    });
    
    dialog.innerHTML = aboutText + '<br><button onclick="this.closest(\'.about-overlay\').remove()" style="background: #2d5a27; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">閉じる</button>';
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  // メインメニューに戻る
  showMainMenu() {
    this.gameState.gamePhase = 'menu';
    this.showScreen('main-menu');
  }
  
  // 自動編成開始
  startAutoFormation(type) {
    const teamName = dom.get('#team-name').value.trim();
    const managerName = dom.get('#manager-name').value.trim();
    
    // バリデーション
    if (!validate.teamName(teamName)) {
      notify.error('チーム名は2-20文字で入力してください');
      return;
    }
    
    if (!validate.managerName(managerName)) {
      notify.error('監督名は1-15文字で入力してください');
      return;
    }
    
    // プレイヤー情報設定
    this.gameState.player.name = managerName;
    this.gameState.player.teamName = teamName;
    this.gameState.player.id = 'player_' + Date.now();
    this.gameState.player.createdAt = new Date().toISOString();
    
    // 自動編成実行
    this.executeAutoFormation(type);
    
    // ゲーム開始
    this.startGame();
  }
  
  // 手動編成表示
  showManualFormation() {
    notify.info('手動編成機能は開発中です。おまかせ編成をご利用ください。');
  }
  
  // 自動編成実行
  executeAutoFormation(type) {
    log.info(`Executing auto formation: ${type}`);
    
    try {
      // TeamBuilderを使用してチーム編成
      const autoTeam = teamBuilder.buildAutoTeam(
        this.gameState.player.budget,
        type
      );
      
      this.gameState.team.coach = autoTeam.coach;
      this.gameState.team.players = autoTeam.players;
      this.gameState.team.tactics = autoTeam.tactics;
      this.gameState.team.stats = autoTeam.stats;
      
      notify.success('チーム編成が完了しました！');
      
    } catch (error) {
      log.error('Auto formation failed', error);
      // フォールバック: 既存のランダム生成
      this.gameState.team.coach = this.generateRandomCoach();
      this.gameState.team.players = this.generateRandomPlayers();
      this.gameState.team.tactics = {
        formation: random.int(1, 12),
        attack: random.int(1, 3),
        defense: random.int(1, 3)
      };
      notify.warning('簡易編成でチームを作成しました');
    }
  }
  
  // ランダム選手生成（仮実装）
  generateRandomPlayers() {
    const players = [];
    const positions = ['GK', 'DF', 'DF', 'DF', 'DF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW'];
    
    for (let i = 0; i < 20; i++) {
      players.push({
        id: i + 1,
        name: `選手${i + 1}`,
        position: positions[i],
        age: random.int(18, 35),
        abilities: [
          random.int(40, 90), // スピード
          random.int(40, 90), // パワー
          random.int(40, 90), // テクニック
          random.int(40, 90), // スタミナ
          random.int(40, 90), // IQ
          random.int(40, 90)  // 運
        ],
        cost: random.int(30000000, 200000000), // 0.3-2億KR
        personality: random.choice(['努力家', '天才肌', 'ムードメーカー', '一匹狼']),
        injured: false,
        injuryDays: 0
      });
    }
    
    return players;
  }
  
  // ゲーム開始
  startGame() {
    this.gameState.gamePhase = 'playing';
    this.initializeLeague();
    this.showScreen('game-main');
    this.saveGame();
    
    notify.success('ゲームを開始しました！');
  }
  
  // リーグ初期化
  initializeLeague() {
    log.info('Initializing league...');
    
    try {
      // プレイヤーチーム準備
      const playerTeam = {
        name: this.gameState.player.teamName,
        coach: this.gameState.team.coach,
        players: this.gameState.team.players,
        tactics: this.gameState.team.tactics,
        stats: this.gameState.team.stats
      };
      
      // LeagueManagerを使用してリーグ初期化
      const league = leagueManager.initializeLeague(playerTeam, this.gameState.league.season);
      
      // ゲーム状態にリーグデータを統合
      this.gameState.league = {
        ...this.gameState.league,
        ...league
      };
      
      log.info('League initialized with LeagueManager');
      
    } catch (error) {
      log.error('League initialization failed', error);
      // フォールバック: 既存の実装
      this.gameState.league.teams = this.generateLeagueTeams();
      this.generateMatchSchedule();
      this.updateStandings();
      log.warn('Used fallback league initialization');
    }
  }
  
  // リーグチーム生成
  generateLeagueTeams() {
    const teams = [];
    
    // プレイヤーチーム
    teams.push({
      id: this.gameState.player.id,
      name: this.gameState.player.teamName,
      isPlayer: true,
      coach: this.gameState.team.coach,
      players: this.gameState.team.players,
      tactics: this.gameState.team.tactics,
      stats: { ...this.gameState.team.stats }
    });
    
    // NPCチーム生成
    const npcNames = [
      'レッドタイガーズ', 'ブルーウィング', 'グリーンライオンズ', 'イエローサンダー',
      'ブラックパンサー', 'ホワイトイーグル', 'シルバーウルブズ', 'ゴールデンホークス',
      'パープルドラゴン', 'オレンジフェニックス', 'ピンクユニコーン'
    ];
    
    for (let i = 0; i < 11; i++) {
      teams.push({
        id: `npc_${i + 1}`,
        name: npcNames[i],
        isPlayer: false,
        coach: this.generateRandomCoach(),
        players: this.generateRandomPlayers(),
        tactics: {
          formation: random.int(1, 12),
          attack: random.int(1, 3),
          defense: random.int(1, 3)
        },
        stats: {
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0
        }
      });
    }
    
    return teams;
  }
  
  // ランダム監督生成
  generateRandomCoach() {
    const coachNames = ['戦術 マスター', '情熱 ファイア', '冷静 アイス', '経験 ベテラン', '若手 フューチャー'];
    return {
      id: random.int(1, 10),
      name: random.choice(coachNames),
      abilities: [
        random.int(5, 10), // カリスマ
        random.int(5, 10), // 共感
        random.int(5, 10), // 指導力
        random.int(5, 10)  // 運
      ],
      cost: random.int(100000000, 400000000)
    };
  }
  
  // 対戦表生成
  generateMatchSchedule() {
    const teams = this.gameState.league.teams;
    const matches = [];
    
    // 総当たり戦（ホーム・アウェイ）
    for (let round = 0; round < 2; round++) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const home = round === 0 ? teams[i] : teams[j];
          const away = round === 0 ? teams[j] : teams[i];
          
          matches.push({
            day: matches.length + 1,
            home: { id: home.id, name: home.name },
            away: { id: away.id, name: away.name },
            result: null
          });
        }
      }
    }
    
    // シャッフルして日程をランダムに
    this.gameState.league.matches = random.shuffle(matches).slice(0, 22);
    
    // 日数を再設定
    this.gameState.league.matches.forEach((match, index) => {
      match.day = index + 1;
    });
  }
  
  // 順位表更新
  updateStandings() {
    const standings = this.gameState.league.teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      isPlayer: team.isPlayer,
      ...team.stats,
      goalDiff: team.stats.goalsFor - team.stats.goalsAgainst
    }));
    
    // ソート: 勝点 → 得失点差 → 得点数
    standings.sort((a, b) => {
      if (a.points !== b.points) return b.points - a.points;
      if (a.goalDiff !== b.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
    
    // 順位設定
    standings.forEach((team, index) => {
      team.rank = index + 1;
    });
    
    this.gameState.league.standings = standings;
  }
  
  // プレイヤーチーム取得
  getPlayerTeam() {
    return this.gameState.league.teams.find(team => team.isPlayer);
  }
  
  // チーム順位取得
  getTeamRank(teamId) {
    const team = this.gameState.league.standings.find(t => t.teamId === teamId);
    return team ? team.rank : 0;
  }
  
  // 次の試合取得
  getNextMatch() {
    const playerTeam = this.getPlayerTeam();
    if (!playerTeam) return null;
    
    const nextMatch = this.gameState.league.matches.find(match => 
      !match.result && 
      (match.home.id === playerTeam.id || match.away.id === playerTeam.id)
    );
    
    if (nextMatch) {
      const isHome = nextMatch.home.id === playerTeam.id;
      return {
        ...nextMatch,
        opponent: isHome ? nextMatch.away : nextMatch.home,
        isHome
      };
    }
    
    return null;
  }
  
  // ゲーム保存
  saveGame() {
    try {
      const success = saveManager.saveGame(this.gameState);
      if (success) {
        log.info('Game saved successfully');
        return true;
      } else {
        throw new Error('SaveManager returned false');
      }
    } catch (error) {
      log.error('Failed to save game', error);
      notify.error('ゲームの保存に失敗しました');
      return false;
    }
  }
  
  // ゲーム読み込み
  loadGame() {
    try {
      const savedData = saveManager.loadGame();
      if (savedData && savedData.initialized) {
        this.gameState = { ...this.gameState, ...savedData };
        this.showScreen('game-main');
        notify.success('ゲームを読み込みました');
        log.info('Game loaded successfully');
        return true;
      } else {
        notify.error('保存されたゲームが見つかりません');
        return false;
      }
    } catch (error) {
      log.error('Failed to load game', error);
      notify.error('ゲームの読み込みに失敗しました');
      return false;
    }
  }
  
  // ゲームデータ読み込み（初期化時）
  loadGameData() {
    try {
      // SaveManagerを使用してデータ読み込み
      const savedData = saveManager.loadGame();
      if (savedData) {
        this.gameState = { ...this.gameState, ...savedData };
        log.info('Saved game data loaded via SaveManager');
      }
      
      // 設定読み込み
      const savedSettings = saveManager.loadSettings();
      if (savedSettings) {
        this.gameState.settings = { ...this.gameState.settings, ...savedSettings };
        log.info('Game settings loaded via SaveManager');
      }
    } catch (error) {
      log.error('Failed to load game data', error);
      // フォールバック: 従来の方法
      const savedData = storage.get('gameData');
      if (savedData) {
        this.gameState = { ...this.gameState, ...savedData };
      }
      const savedSettings = storage.get('gameSettings');
      if (savedSettings) {
        this.gameState.settings = { ...this.gameState.settings, ...savedSettings };
      }
    }
  }
  
  // 自動保存開始
  startAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      if (this.gameState.settings.autoSave && this.gameState.gamePhase === 'playing') {
        this.saveGame();
      }
    }, 30000); // 30秒ごと
    
    log.info('Auto-save started');
  }
  
  // 新しいゲーム開始
  startNewGame(playerData) {
    try {
      log.info('Starting new game');
      
      // プレイヤーデータ初期化
      this.gameState.player = {
        id: `player_${Date.now()}`,
        name: playerData.name || 'プレイヤー',
        teamName: playerData.teamName || 'マイチーム',
        budget: 2800000000, // 28億KR
        createdAt: new Date().toISOString()
      };
      
      // 自動チーム編成（オプション）
      if (playerData.autoTeam) {
        const autoTeam = teamBuilder.buildAutoTeam(
          this.gameState.player.budget, 
          playerData.teamType || 'balanced'
        );
        
        this.gameState.team = {
          coach: autoTeam.coach,
          players: autoTeam.players,
          tactics: autoTeam.tactics,
          stats: autoTeam.stats
        };
        
        // リーグ初期化
        this.initializeLeague();
        
        this.gameState.gamePhase = 'playing';
      } else {
        this.gameState.gamePhase = 'team_setup';
      }
      
      log.info('New game started successfully');
      return true;
      
    } catch (error) {
      log.error('Failed to start new game', error);
      return false;
    }
  }
  
  // 次の日進行
  advanceToNextDay() {
    try {
      if (this.gameState.league.day > this.gameState.league.maxDay) {
        notify.info('シーズンが終了しました');
        return false;
      }
      
      const result = leagueManager.processMatchDay(this.gameState.league, this.gameState.league.day);
      
      // 結果をゲーム状態に反映
      this.gameState.league.standings = result.standings;
      this.gameState.league.phase = result.phase;
      
      // UI更新
      this.updateGameMain();
      
      // 月次成長処理（4日ごと）
      if (this.gameState.league.day % 4 === 0) {
        this.processMonthlyGrowth();
      }
      
      // 自動保存
      this.saveGame();
      
      return true;
      
    } catch (error) {
      log.error('Failed to advance day', error);
      notify.error('日程進行に失敗しました');
      return false;
    }
  }
  
  // 月次成長処理
  processMonthlyGrowth() {
    try {
      const playerTeam = this.getPlayerTeam();
      if (playerTeam && playerTeam.players) {
        const growthResults = growthEngine.processMonthlyGrowth(playerTeam, playerTeam.coach);
        
        if (growthResults.playerGrowth.length > 0) {
          notify.success(`${growthResults.playerGrowth.length}人の選手が成長しました！`);
        }
        
        if (growthResults.awakenings.length > 0) {
          notify.success(`${growthResults.awakenings.length}人の選手が覚醒しました！`);
        }
        
        if (growthResults.injuries.length > 0) {
          notify.warning(`${growthResults.injuries.length}人の選手が怪我をしました`);
        }
      }
    } catch (error) {
      log.error('Monthly growth processing failed', error);
    }
  }
  
  // データリセット確認
  confirmDataReset() {
    confirm(
      'すべてのゲームデータが削除されます。<br>この操作は取り消せません。<br><br>本当にリセットしますか？',
      () => this.resetGameData()
    );
  }
  
  // ゲームデータリセット
  resetGameData() {
    try {
      saveManager.clearAllData();
      
      // 初期状態に戻す
      this.gameState = {
        initialized: false,
        currentScreen: 'loading',
        gamePhase: 'menu',
        player: {
          id: null,
          name: '',
          teamName: '',
          budget: 2800000000,
          createdAt: null
        },
        team: {
          coach: null,
          players: [],
          tactics: { formation: 1, attack: 1, defense: 1 },
          stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
        },
        league: {
          season: 1,
          day: 1,
          maxDay: 22,
          teams: [],
          matches: [],
          standings: [],
          phase: 'registration'
        },
        settings: {
          sound: true,
          volume: 50,
          animations: true,
          autoSave: true
        }
      };
      
      this.showMainMenu();
      notify.success('ゲームデータをリセットしました');
      log.info('Game data reset');
    } catch (error) {
      log.error('Failed to reset game data', error);
      notify.error('データリセットに失敗しました');
    }
  }
  
  // メインメニューに戻る確認
  confirmReturnToMenu() {
    if (this.gameState.gamePhase === 'playing') {
      confirm(
        'ゲームを中断してメインメニューに戻りますか？<br>進行状況は自動保存されます。',
        () => this.showMainMenu()
      );
    } else {
      this.showMainMenu();
    }
  }
  
  // ゲーム終了処理
  destroy() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.saveGame();
    log.info('Game engine destroyed');
  }
}

// グローバルインスタンス
let game = null;

// ゲーム初期化
const initGame = async () => {
  try {
    game = new GameEngine();
    await game.init();
  } catch (error) {
    log.error('Failed to initialize game', error);
    notify.error('ゲームの初期化に失敗しました');
  }
};

// ページ離脱時の処理
window.addEventListener('beforeunload', () => {
  if (game) {
    game.destroy();
  }
});