import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { auth, logActivity, submitErrorReport } from './firebase';

if (typeof window !== 'undefined') {
  // 1. Auto-Catch Global JS Errors -> Firestore `activity_logs` & `error_reports` + Email
  window.onerror = function (msg, url, line, col, error) {
    const msgStr = String(msg || '');
    if (msgStr.includes('WebSocket') || msgStr.includes('websocket') || msgStr.includes('ResizeObserver')) {
      return false;
    }
    const currentEmail = auth.currentUser?.email || 'tamu_anonim@mimi15.id';
    logActivity('js_error', {
      msg: msgStr.slice(0, 500),
      url: String(url || ''),
      line: line || 0,
      col: col || 0,
      user: currentEmail,
    });
    submitErrorReport({
      emailPelapor: currentEmail,
      namaPelapor: auth.currentUser?.displayName || 'Auto-Catch System',
      pesan: `[JS Error Line ${line || 0}] ${msgStr}`,
      errorStack: error?.stack || '',
      type: 'auto_catch',
    }).catch(() => {});
    return false;
  };

  // 2. Auto-Catch Unhandled Promise Rejections (suppress harmless preview WebSocket warnings)
  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (msg.includes('WebSocket') || msg.includes('websocket')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const currentEmail = auth.currentUser?.email || 'tamu_anonim@mimi15.id';
    logActivity('promise_error', {
      reason: msg.slice(0, 500),
      user: currentEmail,
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
