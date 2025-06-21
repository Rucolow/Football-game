/* ========================================
   ユーティリティ関数
======================================== */

// デバッグモード
const DEBUG = true;

// ログ出力関数
const log = {
  info: (message, data = null) => {
    if (DEBUG) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  warn: (message, data = null) => {
    if (DEBUG) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  error: (message, data = null) => {
    console.error(`[ERROR] ${message}`, data || '');
  }
};

// 数値フォーマット関数
const formatNumber = (num) => {
  if (num >= 100000000) {
    return (num / 100000000).toFixed(1) + '億';
  } else if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
};

// 日付フォーマット関数
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
};

// ランダム数値生成
const random = {
  // min以上max以下の整数
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  
  // min以上max未満の浮動小数点数
  float: (min, max) => Math.random() * (max - min) + min,
  
  // 配列からランダム選択
  choice: (array) => array[Math.floor(Math.random() * array.length)],
  
  // 確率判定（0-100%）
  chance: (percentage) => Math.random() * 100 < percentage,
  
  // 配列をシャッフル
  shuffle: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};

// DOM操作ヘルパー
const dom = {
  // 要素取得
  get: (selector) => document.querySelector(selector),
  getAll: (selector) => document.querySelectorAll(selector),
  
  // 要素作成
  create: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    // 属性設定
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // 子要素追加
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },
  
  // クラス操作
  addClass: (element, className) => element.classList.add(className),
  removeClass: (element, className) => element.classList.remove(className),
  toggleClass: (element, className) => element.classList.toggle(className),
  hasClass: (element, className) => element.classList.contains(className),
  
  // 表示/非表示
  show: (element) => element.style.display = 'block',
  hide: (element) => element.style.display = 'none',
  toggle: (element) => {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
  }
};

// アニメーション関数
const animate = {
  // フェードイン
  fadeIn: (element, duration = 300) => {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    const start = performance.now();
    const fade = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    
    requestAnimationFrame(fade);
  },
  
  // フェードアウト
  fadeOut: (element, duration = 300) => {
    const start = performance.now();
    const fade = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = 1 - progress;
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      } else {
        element.style.display = 'none';
      }
    };
    
    requestAnimationFrame(fade);
  },
  
  // スライドダウン
  slideDown: (element, duration = 300) => {
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    const start = performance.now();
    
    const slide = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.height = (targetHeight * progress) + 'px';
      
      if (progress < 1) {
        requestAnimationFrame(slide);
      } else {
        element.style.height = '';
        element.style.overflow = '';
      }
    };
    
    requestAnimationFrame(slide);
  }
};

// バリデーション関数
const validate = {
  // 空文字チェック
  notEmpty: (value) => value && value.trim().length > 0,
  
  // 長さチェック
  length: (value, min, max) => {
    const len = value ? value.length : 0;
    return len >= min && len <= max;
  },
  
  // 数値チェック
  isNumber: (value) => !isNaN(value) && !isNaN(parseFloat(value)),
  
  // 範囲チェック
  range: (value, min, max) => {
    const num = parseFloat(value);
    return num >= min && num <= max;
  },
  
  // チーム名チェック
  teamName: (name) => {
    return validate.notEmpty(name) && 
           validate.length(name, 2, 20) && 
           !/[<>\"'&]/.test(name);
  },
  
  // 監督名チェック
  managerName: (name) => {
    return validate.notEmpty(name) && 
           validate.length(name, 1, 15) && 
           !/[<>\"'&]/.test(name);
  }
};

// ローカルストレージヘルパー
const storage = {
  // データ保存
  set: (key, data) => {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      log.error('Failed to save data to localStorage', error);
      return false;
    }
  },
  
  // データ取得
  get: (key, defaultValue = null) => {
    try {
      const jsonData = localStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : defaultValue;
    } catch (error) {
      log.error('Failed to load data from localStorage', error);
      return defaultValue;
    }
  },
  
  // データ削除
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      log.error('Failed to remove data from localStorage', error);
      return false;
    }
  },
  
  // 全データ削除
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      log.error('Failed to clear localStorage', error);
      return false;
    }
  }
};

// 通知システム
const notify = {
  // 成功通知
  success: (message, duration = 3000) => {
    notify.show(message, 'success', duration);
  },
  
  // 警告通知
  warning: (message, duration = 4000) => {
    notify.show(message, 'warning', duration);
  },
  
  // エラー通知
  error: (message, duration = 5000) => {
    notify.show(message, 'error', duration);
  },
  
  // 情報通知
  info: (message, duration = 3000) => {
    notify.show(message, 'info', duration);
  },
  
  // 通知表示
  show: (message, type = 'info', duration = 3000) => {
    // 既存の通知を削除
    const existing = dom.get('.notification');
    if (existing) {
      existing.remove();
    }
    
    // 通知要素作成
    const notification = dom.create('div', {
      className: `notification notification-${type}`,
      innerHTML: message
    });
    
    // スタイル設定
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      color: 'white',
      fontSize: '14px',
      fontWeight: '600',
      zIndex: '9999',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    // 色設定
    const colors = {
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // DOM に追加
    document.body.appendChild(notification);
    
    // アニメーション開始
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 自動削除
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, duration);
    
    // クリックで削除
    notification.addEventListener('click', () => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    });
  }
};

// デバウンス関数
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// スロットル関数
const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 確認ダイアログ
const confirm = (message, onConfirm, onCancel = null) => {
  const overlay = dom.create('div', {
    className: 'confirm-overlay',
    style: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;'
  });
  
  const dialog = dom.create('div', {
    className: 'confirm-dialog',
    style: 'background: white; padding: 2rem; border-radius: 8px; max-width: 400px; margin: 1rem;'
  });
  
  const messageEl = dom.create('p', {
    innerHTML: message,
    style: 'margin-bottom: 1.5rem; color: #333; line-height: 1.5;'
  });
  
  const buttons = dom.create('div', {
    style: 'display: flex; gap: 1rem; justify-content: flex-end;'
  });
  
  const cancelBtn = dom.create('button', {
    innerHTML: 'キャンセル',
    style: 'padding: 0.5rem 1rem; border: 1px solid #ccc; background: white; color: #333; border-radius: 4px; cursor: pointer;'
  });
  
  const confirmBtn = dom.create('button', {
    innerHTML: 'OK',
    style: 'padding: 0.5rem 1rem; border: none; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;'
  });
  
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
    if (onCancel) onCancel();
  });
  
  confirmBtn.addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  
  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);
  dialog.appendChild(messageEl);
  dialog.appendChild(buttons);
  overlay.appendChild(dialog);
  
  document.body.appendChild(overlay);
  
  // ESCキーで閉じる
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', handleEsc);
      if (onCancel) onCancel();
    }
  };
  
  document.addEventListener('keydown', handleEsc);
};

// 初期化関数
const initUtils = () => {
  log.info('Utils initialized');
  
  // グローバルエラーハンドラー
  window.addEventListener('error', (event) => {
    log.error('Global error caught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // 未処理のプロミス拒否をキャッチ
  window.addEventListener('unhandledrejection', (event) => {
    log.error('Unhandled promise rejection', event.reason);
  });
};

// DOM読み込み完了時に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initUtils);
} else {
  initUtils();
}