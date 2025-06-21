/* ========================================
   UIマネージャー - UI制御とイベント処理
======================================== */

class UIManager {
  constructor() {
    this.game = null;
    this.currentModal = null;
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.initialized = false;
  }
  
  // 初期化
  init(gameEngine) {
    this.game = gameEngine;
    this.setupEventListeners();
    this.setupTouchEvents();
    this.initialized = true;
    
    log.info('UI Manager initialized');
  }
  
  // イベントリスナー設定
  setupEventListeners() {
    // 設定変更
    const soundToggle = dom.get('#sound-enabled');
    if (soundToggle) {
      soundToggle.addEventListener('change', (e) => {
        this.game.gameState.settings.sound = e.target.checked;
        this.saveSettings();
      });
    }
    
    const volumeSlider = dom.get('#volume');
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        this.game.gameState.settings.volume = parseInt(e.target.value);
        this.saveSettings();
      });
    }
    
    const animationsToggle = dom.get('#animations-enabled');
    if (animationsToggle) {
      animationsToggle.addEventListener('change', (e) => {
        this.game.gameState.settings.animations = e.target.checked;
        this.saveSettings();
        this.updateAnimationSettings();
      });
    }
    
    // ナビゲーションボタン
    const navButtons = dom.getAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.updateNavigation(e.target.closest('.nav-btn'));
      });
    });
    
    // キーボードショートカット
    document.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
    
    // 画面サイズ変更
    window.addEventListener('resize', debounce(() => {
      this.handleResize();
    }, 250));
    
    // フォーカス管理
    document.addEventListener('focusin', (e) => {
      this.handleFocus(e);
    });
  }
  
  // タッチイベント設定
  setupTouchEvents() {
    // スワイプジェスチャー
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipe();
    }, { passive: true });
    
    // タッチフィードバック
    const touchElements = dom.getAll('button, .method-card, .action-btn, .nav-btn');
    touchElements.forEach(element => {
      element.addEventListener('touchstart', (e) => {
        this.addTouchFeedback(e.target);
      }, { passive: true });
      
      element.addEventListener('touchend', (e) => {
        setTimeout(() => {
          this.removeTouchFeedback(e.target);
        }, 150);
      }, { passive: true });
    });
    
    // iOS Safariのバウンススクロール防止
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.no-scroll')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  // スワイプ処理
  handleSwipe() {
    const swipeThreshold = 50;
    const diff = this.touchStartY - this.touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // 上スワイプ
        this.handleSwipeUp();
      } else {
        // 下スワイプ
        this.handleSwipeDown();
      }
    }
  }
  
  // 上スワイプ処理
  handleSwipeUp() {
    // ゲームメニューを閉じる
    const gameMenu = dom.get('#game-menu');
    if (gameMenu && dom.hasClass(gameMenu, 'active')) {
      this.hideGameMenu();
    }
  }
  
  // 下スワイプ処理
  handleSwipeDown() {
    // 必要に応じて実装
  }
  
  // タッチフィードバック追加
  addTouchFeedback(element) {
    if (dom.hasClass(element, 'no-feedback')) return;
    
    element.style.transform = 'scale(0.95)';
    element.style.transition = 'transform 0.1s ease';
    
    // 触覚フィードバック (iOS)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }
  
  // タッチフィードバック削除
  removeTouchFeedback(element) {
    element.style.transform = '';
    element.style.transition = '';
  }
  
  // キーボード処理
  handleKeyboard(e) {
    switch (e.key) {
      case 'Escape':
        this.handleEscape();
        break;
      case 'Enter':
        if (e.target.tagName === 'INPUT') {
          this.handleEnter(e.target);
        }
        break;
      case 'Tab':
        this.handleTab(e);
        break;
    }
  }
  
  // ESCキー処理
  handleEscape() {
    // モーダルやメニューを閉じる
    if (this.currentModal) {
      this.closeModal();
    } else if (dom.get('#game-menu.active')) {
      this.hideGameMenu();
    } else if (this.game.gameState.currentScreen !== 'main-menu') {
      this.game.showMainMenu();
    }
  }
  
  // Enterキー処理
  handleEnter(input) {
    const form = input.closest('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"], .method-btn');
      if (submitBtn) {
        submitBtn.click();
      }
    }
  }
  
  // Tab処理
  handleTab(e) {
    // フォーカスループの実装（アクセシビリティ向上）
    const modal = dom.get('.modal.active');
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }
  
  // フォーカス処理
  handleFocus(e) {
    // モバイルでの入力フィールドフォーカス時の処理
    if (e.target.tagName === 'INPUT' && window.innerWidth <= 768) {
      setTimeout(() => {
        e.target.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 300);
    }
  }
  
  // 画面サイズ変更処理
  handleResize() {
    // モバイル表示の調整
    this.updateMobileLayout();
    
    // モーダルの位置調整
    if (this.currentModal) {
      this.adjustModalPosition();
    }
  }
  
  // モバイルレイアウト更新
  updateMobileLayout() {
    const isMobile = window.innerWidth <= 768;
    document.body.classList.toggle('mobile', isMobile);
    
    // CSS変数更新
    document.documentElement.style.setProperty(
      '--vh', 
      window.innerHeight * 0.01 + 'px'
    );
  }
  
  // ナビゲーション更新
  updateNavigation(activeBtn) {
    // アクティブ状態を更新
    dom.getAll('.nav-btn').forEach(btn => {
      dom.removeClass(btn, 'active');
    });
    dom.addClass(activeBtn, 'active');
    
    // ナビゲーション音（設定が有効な場合）
    this.playSound('nav');
  }
  
  // ゲームメニュー表示/非表示
  toggleGameMenu() {
    const gameMenu = dom.get('#game-menu');
    if (gameMenu) {
      if (dom.hasClass(gameMenu, 'active')) {
        this.hideGameMenu();
      } else {
        this.showGameMenu();
      }
    }
  }
  
  // ゲームメニュー表示
  showGameMenu() {
    const gameMenu = dom.get('#game-menu');
    if (gameMenu) {
      dom.addClass(gameMenu, 'active');
      this.playSound('menu');
      
      // 背景クリックで閉じる
      gameMenu.addEventListener('click', (e) => {
        if (e.target === gameMenu) {
          this.hideGameMenu();
        }
      });
    }
  }
  
  // ゲームメニュー非表示
  hideGameMenu() {
    const gameMenu = dom.get('#game-menu');
    if (gameMenu) {
      dom.removeClass(gameMenu, 'active');
    }
  }
  
  // チーム管理画面表示
  showTeamManagement() {
    this.showModal('team-management', '👥 チーム管理', this.renderTeamManagement());
    this.updateNavigation(dom.get('.nav-btn[onclick*="showTeamManagement"]'));
  }
  
  // 戦術設定画面表示
  showTactics() {
    this.showModal('tactics', '⚽ 戦術設定', this.renderTactics());
    this.updateNavigation(dom.get('.nav-btn[onclick*="showTactics"]'));
  }
  
  // 順位表画面表示
  showLeagueTable() {
    this.showModal('league-table', '📊 リーグ順位表', this.renderLeagueTable());
    this.updateNavigation(dom.get('.nav-btn[onclick*="showLeagueTable"]'));
  }
  
  // 試合結果画面表示
  showMatchResults() {
    this.showModal('match-results', '🎯 試合結果', this.renderMatchResults());
  }
  
  // ゲームメイン画面表示
  showGameMain() {
    this.closeModal();
    this.game.showScreen('game-main');
    this.updateNavigation(dom.get('.nav-btn[onclick*="showGameMain"]'));
  }
  
  // 設定画面を閉じる
  closeSettings() {
    this.game.showMainMenu();
  }
  
  // モーダル表示
  showModal(id, title, content) {
    this.closeModal(); // 既存のモーダルを閉じる
    
    const overlay = dom.create('div', {
      className: 'modal-overlay active',
      style: `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        backdrop-filter: blur(5px);
      `
    });
    
    const modal = dom.create('div', {
      className: 'modal active',
      style: `
        background: white;
        border-radius: 8px;
        max-width: 600px;
        width: 100%;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      `
    });
    
    const header = dom.create('div', {
      className: 'modal-header',
      style: `
        background: var(--primary);
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `,
      innerHTML: `
        <h3 style="margin: 0; font-size: 1.2rem;">${title}</h3>
        <button class="modal-close" style="
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        ">&times;</button>
      `
    });
    
    const body = dom.create('div', {
      className: 'modal-body',
      style: `
        padding: 1rem;
        overflow-y: auto;
        flex: 1;
      `,
      innerHTML: content
    });
    
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    
    // イベントリスナー
    header.querySelector('.modal-close').addEventListener('click', () => {
      this.closeModal();
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal();
      }
    });
    
    document.body.appendChild(overlay);
    this.currentModal = overlay;
    
    // アニメーション
    if (this.game.gameState.settings.animations) {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.9)';
      
      requestAnimationFrame(() => {
        overlay.style.transition = 'opacity 0.3s ease';
        modal.style.transition = 'transform 0.3s ease';
        overlay.style.opacity = '1';
        modal.style.transform = 'scale(1)';
      });
    }
    
    // フォーカス管理
    const firstFocusable = modal.querySelector('button, input, select, textarea');
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    this.playSound('modal');
  }
  
  // モーダル閉じる
  closeModal() {
    if (this.currentModal) {
      if (this.game.gameState.settings.animations) {
        this.currentModal.style.opacity = '0';
        const modal = this.currentModal.querySelector('.modal');
        if (modal) {
          modal.style.transform = 'scale(0.9)';
        }
        
        setTimeout(() => {
          if (this.currentModal) {
            this.currentModal.remove();
            this.currentModal = null;
          }
        }, 300);
      } else {
        this.currentModal.remove();
        this.currentModal = null;
      }
    }
  }
  
  // モーダル位置調整
  adjustModalPosition() {
    if (this.currentModal) {
      const modal = this.currentModal.querySelector('.modal');
      if (modal) {
        const rect = modal.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        
        if (rect.height > viewHeight * 0.9) {
          modal.style.height = '90vh';
        }
      }
    }
  }
  
  // チーム管理レンダリング
  renderTeamManagement() {
    if (!this.game.gameState.team.players.length) {
      return '<p class="text-center">チームが編成されていません</p>';
    }
    
    const coach = this.game.gameState.team.coach;
    const players = this.game.gameState.team.players;
    
    let html = '';
    
    // 監督情報
    if (coach) {
      html += `
        <div class="coach-section" style="margin-bottom: 2rem;">
          <h4 style="color: var(--primary); margin-bottom: 1rem;">👨‍💼 監督</h4>
          <div style="background: var(--light-gray); padding: 1rem; border-radius: 8px;">
            <div style="font-weight: 600; margin-bottom: 0.5rem;">${coach.name}</div>
            <div style="font-size: 0.9rem; color: var(--dark-gray);">
              カリスマ: ${coach.abilities[0]} | 
              共感: ${coach.abilities[1]} | 
              指導力: ${coach.abilities[2]} | 
              運: ${coach.abilities[3]}
            </div>
          </div>
        </div>
      `;
    }
    
    // 選手一覧
    html += '<h4 style="color: var(--primary); margin-bottom: 1rem;">👥 選手一覧</h4>';
    
    const positions = ['GK', 'DF', 'MF', 'FW'];
    positions.forEach(pos => {
      const posPlayers = players.filter(p => p.position === pos);
      if (posPlayers.length > 0) {
        html += `
          <div style="margin-bottom: 1.5rem;">
            <h5 style="margin-bottom: 0.75rem; color: var(--secondary);">${pos} (${posPlayers.length}名)</h5>
            <div style="display: grid; gap: 0.5rem;">
        `;
        
        posPlayers.forEach(player => {
          const avgAbility = Math.round(player.abilities.reduce((a, b) => a + b, 0) / 6);
          const injuryStatus = player.injured ? '🤕' : '';
          
          html += `
            <div style="
              background: white;
              border: 1px solid var(--light-gray);
              border-radius: 4px;
              padding: 0.75rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <div>
                <span style="font-weight: 600;">${player.name}</span>
                <span style="margin-left: 0.5rem; color: var(--dark-gray); font-size: 0.9rem;">
                  ${player.age}歳 ${injuryStatus}
                </span>
              </div>
              <div style="font-weight: 600; color: var(--primary);">
                ${avgAbility}
              </div>
            </div>
          `;
        });
        
        html += '</div></div>';
      }
    });
    
    return html;
  }
  
  // 戦術設定レンダリング
  renderTactics() {
    const tactics = this.game.gameState.team.tactics;
    
    const formations = [
      '4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-5-1', '3-4-3',
      '4-2-3-1', '3-6-1', '5-4-1', '4-1-4-1', '3-3-4', '5-2-3'
    ];
    
    const attacks = ['速攻', 'バランス', 'ポゼッション'];
    const defenses = ['プレス', 'バランス', 'リトリート'];
    
    return `
      <div class="tactics-section">
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--primary); margin-bottom: 1rem;">⚽ フォーメーション</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
            ${formations.map((formation, index) => `
              <button onclick="ui.updateTactics('formation', ${index + 1})" style="
                padding: 0.75rem;
                border: 2px solid ${tactics.formation === index + 1 ? 'var(--accent)' : 'var(--light-gray)'};
                background: ${tactics.formation === index + 1 ? 'rgba(118, 199, 192, 0.1)' : 'white'};
                border-radius: 4px;
                cursor: pointer;
                font-weight: ${tactics.formation === index + 1 ? '600' : 'normal'};
                transition: all 0.2s ease;
              ">${formation}</button>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--primary); margin-bottom: 1rem;">🔥 攻撃戦術</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
            ${attacks.map((attack, index) => `
              <button onclick="ui.updateTactics('attack', ${index + 1})" style="
                padding: 0.75rem;
                border: 2px solid ${tactics.attack === index + 1 ? 'var(--accent)' : 'var(--light-gray)'};
                background: ${tactics.attack === index + 1 ? 'rgba(118, 199, 192, 0.1)' : 'white'};
                border-radius: 4px;
                cursor: pointer;
                font-weight: ${tactics.attack === index + 1 ? '600' : 'normal'};
                transition: all 0.2s ease;
              ">${attack}</button>
            `).join('')}
          </div>
        </div>
        
        <div style="margin-bottom: 2rem;">
          <h4 style="color: var(--primary); margin-bottom: 1rem;">🛡️ 守備戦術</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
            ${defenses.map((defense, index) => `
              <button onclick="ui.updateTactics('defense', ${index + 1})" style="
                padding: 0.75rem;
                border: 2px solid ${tactics.defense === index + 1 ? 'var(--accent)' : 'var(--light-gray)'};
                background: ${tactics.defense === index + 1 ? 'rgba(118, 199, 192, 0.1)' : 'white'};
                border-radius: 4px;
                cursor: pointer;
                font-weight: ${tactics.defense === index + 1 ? '600' : 'normal'};
                transition: all 0.2s ease;
              ">${defense}</button>
            `).join('')}
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
          <button onclick="ui.closeModal(); ui.game.saveGame(); notify.success('戦術を保存しました');" style="
            background: var(--primary);
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 4px;
            font-weight: 600;
            cursor: pointer;
          ">保存</button>
        </div>
      </div>
    `;
  }
  
  // 戦術更新
  updateTactics(type, value) {
    this.game.gameState.team.tactics[type] = value;
    
    // 戦術画面を再描画
    const modalBody = dom.get('.modal-body');
    if (modalBody) {
      modalBody.innerHTML = this.renderTactics();
    }
    
    this.playSound('select');
  }
  
  // 順位表レンダリング
  renderLeagueTable() {
    const standings = this.game.gameState.league.standings;
    
    if (!standings.length) {
      return '<p class="text-center">順位表データがありません</p>';
    }
    
    let html = `
      <div class="league-info" style="text-align: center; margin-bottom: 1.5rem; padding: 1rem; background: var(--light-gray); border-radius: 8px;">
        <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
          シーズン${this.game.gameState.league.season} - 第${this.game.gameState.league.day}節
        </div>
        <div style="font-size: 0.9rem; color: var(--dark-gray);">
          12チームリーグ
        </div>
      </div>
      
      <div class="standings-table">
        <div style="
          display: grid;
          grid-template-columns: 30px 1fr 40px 40px 40px 50px;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--primary);
          color: white;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
          font-size: 0.9rem;
        ">
          <div>順位</div>
          <div>チーム名</div>
          <div>勝</div>
          <div>分</div>
          <div>負</div>
          <div>勝点</div>
        </div>
    `;
    
    standings.forEach((team, index) => {
      const isPlayer = team.isPlayer;
      const isTop3 = index < 3;
      
      html += `
        <div style="
          display: grid;
          grid-template-columns: 30px 1fr 40px 40px 40px 50px;
          gap: 0.5rem;
          padding: 0.75rem;
          border-bottom: 1px solid var(--light-gray);
          background: ${isPlayer ? 'rgba(118, 199, 192, 0.1)' : (isTop3 ? 'rgba(255, 215, 0, 0.1)' : 'white')};
          font-size: 0.9rem;
        ">
          <div style="font-weight: 600; color: ${isTop3 ? '#ffd700' : 'var(--text)'};">
            ${team.rank}
          </div>
          <div style="font-weight: ${isPlayer ? '600' : 'normal'}; color: ${isPlayer ? 'var(--primary)' : 'var(--text)'};">
            ${isPlayer ? '⭐ ' : ''}${team.teamName}
          </div>
          <div>${team.wins}</div>
          <div>${team.draws}</div>
          <div>${team.losses}</div>
          <div style="font-weight: 600; color: var(--primary);">${team.points}</div>
        </div>
      `;
    });
    
    html += '</div>';
    
    if (standings.length >= 3) {
      html += `
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(255, 215, 0, 0.1); border-radius: 8px; text-align: center;">
          <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem;">
            🏆 プレーオフ進出
          </div>
          <div style="font-size: 0.9rem; color: var(--dark-gray);">
            上位3チームがシーズン終了後にプレーオフに進出します
          </div>
        </div>
      `;
    }
    
    return html;
  }
  
  // 試合結果レンダリング
  renderMatchResults() {
    const matches = this.game.gameState.league.matches.filter(m => m.result);
    
    if (!matches.length) {
      return '<p class="text-center">まだ試合結果がありません</p>';
    }
    
    let html = '<div class="match-results">';
    
    // 最新の結果から表示
    matches.slice(-10).reverse().forEach(match => {
      const playerTeam = this.game.getPlayerTeam();
      const isPlayerMatch = playerTeam && 
        (match.home.id === playerTeam.id || match.away.id === playerTeam.id);
      
      html += `
        <div style="
          background: ${isPlayerMatch ? 'rgba(118, 199, 192, 0.1)' : 'white'};
          border: 1px solid var(--light-gray);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          ${isPlayerMatch ? 'border-color: var(--accent);' : ''}
        ">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
              <div style="font-weight: 600; margin-bottom: 0.25rem;">
                ${match.home.name}
              </div>
              <div style="font-size: 0.9rem; color: var(--dark-gray);">
                vs ${match.away.name}
              </div>
            </div>
            <div style="text-align: center; font-size: 1.5rem; font-weight: 600; color: var(--primary);">
              ${match.result.homeScore} - ${match.result.awayScore}
            </div>
          </div>
          <div style="text-align: right; font-size: 0.8rem; color: var(--dark-gray); margin-top: 0.5rem;">
            第${match.day}節
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    return html;
  }
  
  // 音声再生
  playSound(type) {
    if (!this.game.gameState.settings.sound) return;
    
    // Web Audio APIを使った音声再生（Phase 3で実装予定）
    // 現在は無音
  }
  
  // 設定保存
  saveSettings() {
    storage.set('gameSettings', this.game.gameState.settings);
  }
  
  // アニメーション設定更新
  updateAnimationSettings() {
    const animationsEnabled = this.game.gameState.settings.animations;
    document.body.classList.toggle('animations-disabled', !animationsEnabled);
    
    if (!animationsEnabled) {
      // CSSでアニメーションを無効化
      const style = document.createElement('style');
      style.innerHTML = `
        .animations-disabled *,
        .animations-disabled *::before,
        .animations-disabled *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// グローバルインスタンス
const ui = new UIManager();