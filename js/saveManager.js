/* ========================================
   セーブマネージャー - データ永続化管理
======================================== */

class SaveManager {
  constructor() {
    this.version = '1.0.0';
    this.storageKeys = {
      gameData: 'footballManager_gameData',
      settings: 'footballManager_settings',
      backup: 'footballManager_backup',
      stats: 'footballManager_stats'
    };
    
    this.compressionEnabled = true;
    this.maxBackups = 3;
    this.autoSaveInterval = 30000; // 30秒
  }
  
  // ゲームデータ保存
  saveGame(gameState) {
    try {
      const saveData = this.prepareSaveData(gameState);
      const compressed = this.compressionEnabled ? this.compress(saveData) : saveData;
      
      // メイン保存
      const success = storage.set(this.storageKeys.gameData, {
        version: this.version,
        timestamp: new Date().toISOString(),
        data: compressed
      });
      
      if (success) {
        // バックアップ作成
        this.createBackup(compressed);
        
        // 統計更新
        this.updateSaveStats();
        
        log.info('Game saved successfully');
        return true;
      } else {
        throw new Error('Failed to save to localStorage');
      }
      
    } catch (error) {
      log.error('Save failed', error);
      notify.error('ゲームの保存に失敗しました');
      return false;
    }
  }
  
  // ゲームデータ読み込み
  loadGame() {
    try {
      const savedData = storage.get(this.storageKeys.gameData);
      
      if (!savedData) {
        log.info('No saved game found');
        return null;
      }
      
      // バージョンチェック
      if (!this.isCompatibleVersion(savedData.version)) {
        log.warn('Incompatible save version', savedData.version);
        return this.handleVersionMismatch(savedData);
      }
      
      // データ復元
      const gameState = this.compressionEnabled ? 
        this.decompress(savedData.data) : savedData.data;
      
      const validatedData = this.validateSaveData(gameState);
      
      log.info('Game loaded successfully');
      return validatedData;
      
    } catch (error) {
      log.error('Load failed', error);
      
      // バックアップから復元を試行
      return this.loadFromBackup();
    }
  }
  
  // 保存データ準備
  prepareSaveData(gameState) {
    // 不要なデータを除外して軽量化
    const saveData = {
      version: this.version,
      player: { ...gameState.player },
      team: { ...gameState.team },
      league: {
        season: gameState.league.season,
        day: gameState.league.day,
        maxDay: gameState.league.maxDay,
        phase: gameState.league.phase,
        teams: gameState.league.teams.map(team => ({
          id: team.id,
          name: team.name,
          isPlayer: team.isPlayer,
          stats: { ...team.stats },
          tactics: { ...team.tactics }
        })),
        matches: gameState.league.matches,
        standings: gameState.league.standings
      },
      settings: { ...gameState.settings },
      gamePhase: gameState.gamePhase,
      timestamp: new Date().toISOString()
    };
    
    return saveData;
  }
  
  // データ圧縮
  compress(data) {
    try {
      const jsonString = JSON.stringify(data);
      
      // 簡易圧縮（繰り返しパターンの置換）
      let compressed = jsonString
        .replace(/{"id":/g, '{¡:')
        .replace(/,"name":/g, ',№:')
        .replace(/,"isPlayer":/g, ',¿:')
        .replace(/,"stats":/g, ',§:')
        .replace(/,"tactics":/g, ',†:')
        .replace(/,"abilities":/g, ',∞:')
        .replace(/,"position":/g, ',Ω:')
        .replace(/,"wins":/g, ',α:')
        .replace(/,"draws":/g, ',β:')
        .replace(/,"losses":/g, ',γ:')
        .replace(/,"goalsFor":/g, ',δ:')
        .replace(/,"goalsAgainst":/g, ',ε:')
        .replace(/,"points":/g, ',ζ:');
      
      log.info(`Compression: ${jsonString.length} -> ${compressed.length} bytes`);
      return compressed;
      
    } catch (error) {
      log.warn('Compression failed, using uncompressed data', error);
      return JSON.stringify(data);
    }
  }
  
  // データ解凍
  decompress(compressedData) {
    try {
      if (typeof compressedData !== 'string') {
        return compressedData; // 圧縮されていない
      }
      
      // 圧縮の逆変換
      const decompressed = compressedData
        .replace(/{¡:/g, '{"id":')
        .replace(/,№:/g, ',"name":')
        .replace(/,¿:/g, ',"isPlayer":')
        .replace(/,§:/g, ',"stats":')
        .replace(/,†:/g, ',"tactics":')
        .replace(/,∞:/g, ',"abilities":')
        .replace(/,Ω:/g, ',"position":')
        .replace(/,α:/g, ',"wins":')
        .replace(/,β:/g, ',"draws":')
        .replace(/,γ:/g, ',"losses":')
        .replace(/,δ:/g, ',"goalsFor":')
        .replace(/,ε:/g, ',"goalsAgainst":')
        .replace(/,ζ:/g, ',"points":');
      
      return JSON.parse(decompressed);
      
    } catch (error) {
      log.error('Decompression failed', error);
      throw new Error('Failed to decompress save data');
    }
  }
  
  // バージョン互換性チェック
  isCompatibleVersion(saveVersion) {
    if (!saveVersion) return false;
    
    const currentMajor = parseInt(this.version.split('.')[0]);
    const saveMajor = parseInt(saveVersion.split('.')[0]);
    
    return currentMajor === saveMajor;
  }
  
  // バージョン不一致処理
  handleVersionMismatch(savedData) {
    log.warn('Save version mismatch, attempting migration');
    
    try {
      // バージョンマイグレーション（必要に応じて実装）
      const migratedData = this.migrateSaveData(savedData);
      
      if (migratedData) {
        notify.warning('セーブデータを新しいバージョンに更新しました');
        return migratedData;
      }
    } catch (error) {
      log.error('Migration failed', error);
    }
    
    notify.error('セーブデータのバージョンが互換性がありません');
    return null;
  }
  
  // セーブデータマイグレーション
  migrateSaveData(savedData) {
    // 将来のバージョンアップ時に実装
    // 現在は基本的な構造チェックのみ
    try {
      const data = this.compressionEnabled ? 
        this.decompress(savedData.data) : savedData.data;
      
      // 必須フィールドの存在確認
      if (!data.player || !data.team || !data.league) {
        throw new Error('Invalid save data structure');
      }
      
      return data;
    } catch (error) {
      log.error('Save data migration failed', error);
      return null;
    }
  }
  
  // データ検証
  validateSaveData(data) {
    const validated = { ...data };
    
    // プレイヤーデータ検証
    if (!validated.player) {
      validated.player = {
        id: null,
        name: '',
        teamName: '',
        budget: 2800000000,
        createdAt: null
      };
    }
    
    // チームデータ検証
    if (!validated.team) {
      validated.team = {
        coach: null,
        players: [],
        tactics: { formation: 1, attack: 1, defense: 1 },
        stats: { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
      };
    }
    
    // リーグデータ検証
    if (!validated.league) {
      validated.league = {
        season: 1,
        day: 1,
        maxDay: 22,
        teams: [],
        matches: [],
        standings: [],
        phase: 'registration'
      };
    }
    
    // 設定データ検証
    if (!validated.settings) {
      validated.settings = {
        sound: true,
        volume: 50,
        animations: true,
        autoSave: true
      };
    }
    
    return validated;
  }
  
  // バックアップ作成
  createBackup(data) {
    try {
      const backups = storage.get(this.storageKeys.backup) || [];
      
      // 新しいバックアップを追加
      backups.push({
        timestamp: new Date().toISOString(),
        data: data
      });
      
      // 古いバックアップを削除（最大数を超えた場合）
      while (backups.length > this.maxBackups) {
        backups.shift();
      }
      
      storage.set(this.storageKeys.backup, backups);
      log.info(`Backup created (${backups.length}/${this.maxBackups})`);
      
    } catch (error) {
      log.warn('Backup creation failed', error);
    }
  }
  
  // バックアップから復元
  loadFromBackup() {
    try {
      const backups = storage.get(this.storageKeys.backup) || [];
      
      if (backups.length === 0) {
        throw new Error('No backups available');
      }
      
      // 最新のバックアップを使用
      const latestBackup = backups[backups.length - 1];
      const data = this.compressionEnabled ? 
        this.decompress(latestBackup.data) : latestBackup.data;
      
      const validatedData = this.validateSaveData(data);
      
      notify.warning('メインデータの読み込みに失敗したため、バックアップから復元しました');
      log.info('Restored from backup');
      
      return validatedData;
      
    } catch (error) {
      log.error('Backup restoration failed', error);
      notify.error('バックアップからの復元にも失敗しました');
      return null;
    }
  }
  
  // 設定保存
  saveSettings(settings) {
    try {
      storage.set(this.storageKeys.settings, {
        version: this.version,
        timestamp: new Date().toISOString(),
        settings: settings
      });
      
      log.info('Settings saved');
      return true;
      
    } catch (error) {
      log.error('Settings save failed', error);
      return false;
    }
  }
  
  // 設定読み込み
  loadSettings() {
    try {
      const savedSettings = storage.get(this.storageKeys.settings);
      
      if (savedSettings && savedSettings.settings) {
        return savedSettings.settings;
      }
      
      return null;
      
    } catch (error) {
      log.error('Settings load failed', error);
      return null;
    }
  }
  
  // 統計更新
  updateSaveStats() {
    try {
      const stats = storage.get(this.storageKeys.stats) || {
        totalSaves: 0,
        lastSave: null,
        firstSave: null
      };
      
      stats.totalSaves++;
      stats.lastSave = new Date().toISOString();
      
      if (!stats.firstSave) {
        stats.firstSave = stats.lastSave;
      }
      
      storage.set(this.storageKeys.stats, stats);
      
    } catch (error) {
      log.warn('Stats update failed', error);
    }
  }
  
  // 統計取得
  getStats() {
    return storage.get(this.storageKeys.stats) || {
      totalSaves: 0,
      lastSave: null,
      firstSave: null
    };
  }
  
  // エクスポート
  exportData() {
    try {
      const gameData = storage.get(this.storageKeys.gameData);
      const settings = storage.get(this.storageKeys.settings);
      const stats = this.getStats();
      
      const exportData = {
        version: this.version,
        exportDate: new Date().toISOString(),
        gameData: gameData,
        settings: settings,
        stats: stats
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `football-manager-save-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      notify.success('セーブデータをエクスポートしました');
      log.info('Data exported');
      
    } catch (error) {
      log.error('Export failed', error);
      notify.error('エクスポートに失敗しました');
    }
  }
  
  // インポート
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          // データ検証
          if (!importData.version || !importData.gameData) {
            throw new Error('Invalid import file format');
          }
          
          // バージョンチェック
          if (!this.isCompatibleVersion(importData.version)) {
            throw new Error('Incompatible save version');
          }
          
          // データ復元
          if (importData.gameData) {
            storage.set(this.storageKeys.gameData, importData.gameData);
          }
          
          if (importData.settings) {
            storage.set(this.storageKeys.settings, importData.settings);
          }
          
          notify.success('セーブデータをインポートしました');
          log.info('Data imported');
          resolve(true);
          
        } catch (error) {
          log.error('Import failed', error);
          notify.error('インポートに失敗しました: ' + error.message);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        const error = new Error('File read failed');
        log.error('File read failed', error);
        notify.error('ファイルの読み込みに失敗しました');
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
  
  // 全データ削除
  clearAllData() {
    try {
      Object.values(this.storageKeys).forEach(key => {
        storage.remove(key);
      });
      
      log.info('All save data cleared');
      return true;
      
    } catch (error) {
      log.error('Clear data failed', error);
      return false;
    }
  }
  
  // ストレージ使用量チェック
  getStorageUsage() {
    try {
      let totalSize = 0;
      const usage = {};
      
      Object.entries(this.storageKeys).forEach(([name, key]) => {
        const data = localStorage.getItem(key);
        const size = data ? data.length : 0;
        usage[name] = {
          size: size,
          sizeFormatted: this.formatBytes(size)
        };
        totalSize += size;
      });
      
      return {
        ...usage,
        total: {
          size: totalSize,
          sizeFormatted: this.formatBytes(totalSize)
        },
        available: this.getAvailableStorage()
      };
      
    } catch (error) {
      log.error('Storage usage check failed', error);
      return null;
    }
  }
  
  // 利用可能ストレージ容量取得
  getAvailableStorage() {
    try {
      const testKey = 'storage_test_' + Date.now();
      const testData = 'x'.repeat(1024); // 1KB
      let available = 0;
      
      // バイナリサーチで利用可能容量を推定
      let low = 0;
      let high = 10240; // 10MB
      
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testSize = mid * 1024; // KB to bytes
        
        try {
          localStorage.setItem(testKey, 'x'.repeat(testSize));
          localStorage.removeItem(testKey);
          available = testSize;
          low = mid + 1;
        } catch {
          high = mid - 1;
        }
      }
      
      return {
        bytes: available,
        formatted: this.formatBytes(available)
      };
      
    } catch (error) {
      log.warn('Available storage check failed', error);
      return null;
    }
  }
  
  // バイト数フォーマット
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// グローバルインスタンス
const saveManager = new SaveManager();