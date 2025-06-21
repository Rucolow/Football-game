/* ========================================
   メインアプリケーション - 初期化と統合制御
======================================== */

// アプリケーション全体の初期化
document.addEventListener('DOMContentLoaded', async () => {
  try {
    log.info('Application starting...');
    
    // ローディング画面表示
    showLoadingScreen();
    
    // 基本的な初期化
    await initializeApp();
    
    // ゲームエンジン初期化
    await initGame();
    
    // 初期化完了
    hideLoadingScreen();
    
    log.info('Application initialized successfully');
    
  } catch (error) {
    log.error('Application initialization failed', error);
    showErrorScreen(error);
  }
});

// ローディング画面表示
function showLoadingScreen() {
  const loadingScreen = dom.get('#loading-screen');
  if (loadingScreen) {
    dom.addClass(loadingScreen, 'active');
    
    // プログレスバーアニメーション
    const progress = dom.get('.loading-progress');
    if (progress) {
      progress.style.width = '0%';
      setTimeout(() => {
        progress.style.transition = 'width 3s ease-in-out';
        progress.style.width = '100%';
      }, 100);
    }
  }
}

// ローディング画面非表示
function hideLoadingScreen() {
  const loadingScreen = dom.get('#loading-screen');
  if (loadingScreen) {
    setTimeout(() => {
      dom.removeClass(loadingScreen, 'active');
    }, 3000); // 3秒後に非表示
  }
}

// エラー画面表示
function showErrorScreen(error) {
  const loadingScreen = dom.get('#loading-screen');
  if (loadingScreen) {
    loadingScreen.innerHTML = `
      <div class="loading-content">
        <div class="loading-logo" style="color: #dc3545;">❌</div>
        <h1>エラーが発生しました</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 1rem 0;">
          ${error.message || 'アプリケーションの初期化に失敗しました'}
        </p>
        <button onclick="location.reload()" style="
          background: white;
          color: #dc3545;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1rem;
        ">
          再読み込み
        </button>
      </div>
    `;
  }
}

// アプリケーション基本初期化
async function initializeApp() {
  // モバイル対応
  setupMobileOptimizations();
  
  // PWA対応
  setupPWA();
  
  // パフォーマンス監視
  setupPerformanceMonitoring();
  
  // グローバルエラーハンドリング
  setupErrorHandling();
  
  // 設定読み込み
  loadApplicationSettings();
}

// モバイル最適化設定
function setupMobileOptimizations() {
  // ビューポート設定
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  // CSS変数設定（ビューポート高さ）
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  
  setVH();
  window.addEventListener('resize', throttle(setVH, 250));
  
  // タッチ操作の最適化
  document.addEventListener('touchstart', () => {}, { passive: true });
  
  // iOS Safariのバウンス防止
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.prevent-scroll')) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // モバイルブラウザの自動ズーム防止
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
  });
  
  log.info('Mobile optimizations applied');
}

// PWA設定
function setupPWA() {
  // Service Worker登録
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          log.info('Service Worker registered successfully');
        })
        .catch((error) => {
          log.warn('Service Worker registration failed', error);
        });
    });
  }
  
  // インストールプロンプト
  let deferredPrompt;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  
  // インストールボタン表示
  function showInstallButton() {
    // インストールボタンをメニューに追加
    const installBtn = dom.create('button', {
      className: 'menu-btn secondary',
      onclick: 'installApp()',
      innerHTML: '<span class="btn-icon">📱</span><span class="btn-text">アプリとしてインストール</span>'
    });
    
    const menuButtons = dom.get('.menu-buttons');
    if (menuButtons && !dom.get('#install-btn')) {
      installBtn.id = 'install-btn';
      menuButtons.appendChild(installBtn);
    }
  }
  
  // インストール実行
  window.installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        notify.success('アプリをインストールしました');
      }
      
      deferredPrompt = null;
      
      const installBtn = dom.get('#install-btn');
      if (installBtn) {
        installBtn.remove();
      }
    }
  };
  
  // インストール完了後の処理
  window.addEventListener('appinstalled', (e) => {
    notify.success('アプリのインストールが完了しました');
    log.info('PWA installed');
  });
  
  log.info('PWA setup completed');
}

// パフォーマンス監視
function setupPerformanceMonitoring() {
  // ページロード時間計測
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      
      log.info(`Page load time: ${loadTime}ms`);
      
      // 3秒以上かかった場合は警告
      if (loadTime > 3000) {
        log.warn('Slow page load detected');
      }
    }, 0);
  });
  
  // メモリ使用量監視（対応ブラウザのみ）
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      const used = Math.round(memory.usedJSHeapSize / 1048576);
      const total = Math.round(memory.totalJSHeapSize / 1048576);
      
      log.info(`Memory usage: ${used}MB / ${total}MB`);
      
      // メモリ使用量が多い場合は警告
      if (used > 100) {
        log.warn('High memory usage detected');
      }
    }, 60000); // 1分ごと
  }
  
  // フレームレート監視
  let frameCount = 0;
  let lastTime = performance.now();
  
  function countFrames() {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      log.info(`FPS: ${frameCount}`);
      
      if (frameCount < 30) {
        log.warn('Low frame rate detected');
      }
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(countFrames);
  }
  
  requestAnimationFrame(countFrames);
}

// エラーハンドリング設定
function setupErrorHandling() {
  // 未処理エラー
  window.addEventListener('error', (event) => {
    log.error('Uncaught error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    // ユーザーに表示（重要なエラーのみ）
    if (event.error && event.error.name !== 'ChunkLoadError') {
      notify.error('予期しないエラーが発生しました');
    }
  });
  
  // 未処理のPromise拒否
  window.addEventListener('unhandledrejection', (event) => {
    log.error('Unhandled promise rejection', event.reason);
    
    // ネットワークエラーの場合
    if (event.reason && event.reason.name === 'NetworkError') {
      notify.warning('ネットワークエラーが発生しました。接続を確認してください。');
    }
  });
  
  // リソース読み込みエラー
  document.addEventListener('error', (event) => {
    if (event.target !== window) {
      log.error('Resource load error', {
        type: event.target.tagName,
        source: event.target.src || event.target.href
      });
    }
  }, true);
}

// アプリケーション設定読み込み
function loadApplicationSettings() {
  // ダークモード設定
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.body.classList.add('dark-mode');
  }
  
  // 動きを減らす設定
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');
  }
  
  // 高コントラスト設定
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  if (prefersHighContrast) {
    document.body.classList.add('high-contrast');
  }
  
  // 保存された設定を適用
  const savedSettings = saveManager.loadSettings();
  if (savedSettings) {
    applySettings(savedSettings);
  }
}

// 設定適用
function applySettings(settings) {
  // 音声設定
  if (settings.sound !== undefined) {
    const soundToggle = dom.get('#sound-enabled');
    if (soundToggle) {
      soundToggle.checked = settings.sound;
    }
  }
  
  // 音量設定
  if (settings.volume !== undefined) {
    const volumeSlider = dom.get('#volume');
    if (volumeSlider) {
      volumeSlider.value = settings.volume;
    }
  }
  
  // アニメーション設定
  if (settings.animations !== undefined) {
    const animationsToggle = dom.get('#animations-enabled');
    if (animationsToggle) {
      animationsToggle.checked = settings.animations;
    }
    
    document.body.classList.toggle('animations-disabled', !settings.animations);
  }
}

// アプリケーション終了処理
window.addEventListener('beforeunload', () => {
  log.info('Application shutting down...');
  
  // ゲームエンジン終了処理
  if (game) {
    game.destroy();
  }
  
  // 最終保存
  if (game && game.gameState.gamePhase === 'playing') {
    game.saveGame();
  }
});

// ページ非表示時の処理
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // バックグラウンドに移行
    log.info('App went to background');
    
    if (game && game.gameState.gamePhase === 'playing') {
      game.saveGame();
    }
  } else {
    // フォアグラウンドに復帰
    log.info('App returned to foreground');
    
    // 必要に応じてデータ更新
    if (game && game.gameState.gamePhase === 'playing') {
      // オンライン状態のチェックなど
    }
  }
});

// オンライン/オフライン状態の監視
window.addEventListener('online', () => {
  notify.success('インターネット接続が復旧しました');
  log.info('App went online');
});

window.addEventListener('offline', () => {
  notify.warning('インターネット接続が切断されました。オフラインモードで動作します。');
  log.info('App went offline');
});

// デバッグ用のグローバル関数
if (DEBUG) {
  window.debugInfo = () => {
    console.log('=== Debug Information ===');
    console.log('Game State:', game ? game.gameState : 'Not initialized');
    console.log('Storage Usage:', saveManager.getStorageUsage());
    console.log('Performance:', {
      memory: performance.memory,
      navigation: performance.navigation,
      timing: performance.timing
    });
  };
  
  window.clearAllData = () => {
    confirm('すべてのデータを削除しますか？', () => {
      saveManager.clearAllData();
      location.reload();
    });
  };
  
  window.exportSave = () => {
    saveManager.exportData();
  };
  
  // コンソールメッセージ
  console.log('%c⚽ Football Manager Game', 'color: #2d5a27; font-size: 24px; font-weight: bold;');
  console.log('%c開発者モードが有効です。デバッグ関数:', 'color: #666; font-size: 14px;');
  console.log('- debugInfo(): デバッグ情報表示');
  console.log('- clearAllData(): 全データ削除');
  console.log('- exportSave(): セーブデータエクスポート');
}