/* ========================================
   Service Worker - オフライン対応とキャッシュ管理
======================================== */

const CACHE_NAME = 'football-manager-v1.0.0';
const STATIC_CACHE_NAME = 'football-manager-static-v1.0.0';

// キャッシュするファイル一覧
const STATIC_FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/utils.js',
  './js/data/coaches.js',
  './js/data/players.js',
  './js/saveManager.js',
  './js/matchEngine.js',
  './js/growthEngine.js',
  './js/teamBuilder.js',
  './js/leagueManager.js',
  './js/uiManager.js',
  './js/gameEngine.js',
  './js/main.js',
  './manifest.json'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  console.log('⚽ Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('⚽ Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('⚽ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('⚽ Service Worker: Installation failed', error);
      })
  );
});

// アクティベーション時の処理
self.addEventListener('activate', (event) => {
  console.log('⚽ Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // 古いキャッシュを削除
              return cacheName !== STATIC_CACHE_NAME && 
                     cacheName !== CACHE_NAME &&
                     cacheName.startsWith('football-manager-');
            })
            .map((cacheName) => {
              console.log('⚽ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('⚽ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// フェッチ時の処理
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }
  
  // ゲーム関連ファイルのキャッシュ戦略
  if (isGameFile(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request));
  }
  // HTMLファイルのネットワーク優先戦略
  else if (url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(networkFirstStrategy(event.request));
  }
  // その他のリソース
  else {
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

// ゲーム関連ファイルかどうかの判定
function isGameFile(pathname) {
  const gameExtensions = ['.js', '.css', '.json'];
  const gameDirectories = ['/js/', '/css/', '/data/'];
  
  return gameExtensions.some(ext => pathname.endsWith(ext)) ||
         gameDirectories.some(dir => pathname.includes(dir)) ||
         pathname === '/manifest.json';
}

// キャッシュ優先戦略
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // バックグラウンドでキャッシュを更新
      updateCache(request, cache);
      return cachedResponse;
    }
    
    // キャッシュにない場合はネットワークから取得
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('⚽ Service Worker: Cache first strategy failed', error);
    
    // オフライン時のフォールバック
    if (request.url.includes('.html')) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('./index.html');
    }
    
    throw error;
  }
}

// ネットワーク優先戦略
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.warn('⚽ Service Worker: Network first strategy failed, trying cache', error);
    
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request) || 
                          await cache.match('./index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// バックグラウンドでキャッシュを更新
async function updateCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // バックグラウンド更新の失敗は無視
    console.warn('⚽ Service Worker: Background cache update failed', error);
  }
}

// メッセージハンドリング
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME,
      cached_files: STATIC_FILES.length
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('football-manager-'))
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// プッシュ通知（将来の機能）
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'サッカーマネージャーからのお知らせ',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'football-manager-notification',
      requireInteraction: false,
      data: data.url || './'
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || '⚽ サッカーマネージャー',
        options
      )
    );
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data || './';
  
  event.waitUntil(
    clients.openWindow(url)
  );
});

// バックグラウンド同期（将来の機能）
self.addEventListener('sync', (event) => {
  if (event.tag === 'save-game-data') {
    event.waitUntil(
      syncGameData()
    );
  }
});

// ゲームデータ同期
async function syncGameData() {
  try {
    // 将来のFirebase統合時に実装
    console.log('⚽ Service Worker: Game data sync triggered');
  } catch (error) {
    console.error('⚽ Service Worker: Game data sync failed', error);
  }
}

console.log('⚽ Service Worker: Script loaded');