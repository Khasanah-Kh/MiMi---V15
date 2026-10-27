import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createLogger, defineConfig, type Plugin } from 'vite';

// 1. Custom Logger to suppress server-side Vite WebSocket warnings
const customLogger = createLogger();
const originalLoggerWarn = customLogger.warn;
const originalLoggerError = customLogger.error;

customLogger.warn = (msg, options) => {
  const str = String(msg || '');
  if (
    str.includes('WebSocket') ||
    str.includes('failed to connect to websocket') ||
    str.includes('closed without opened') ||
    str.includes('WebSocket connection to')
  ) {
    return;
  }
  originalLoggerWarn(msg, options);
};

customLogger.error = (msg, options) => {
  const str = String(msg || '');
  if (
    str.includes('WebSocket') ||
    str.includes('failed to connect to websocket') ||
    str.includes('closed without opened') ||
    str.includes('WebSocket connection to')
  ) {
    return;
  }
  originalLoggerError(msg, options);
};

// 2. Robust Plugin Middleware to handle WebSocket errors & dead socket cleanup
function suppressWebSocketErrorsPlugin(): Plugin {
  return {
    name: 'suppress-websocket-errors',
    configureServer(server) {
      // Handle socket client errors gracefully without noisy stack traces
      server.httpServer?.on('clientError', (err: any, socket: any) => {
        const msg = String(err?.message || err || '');
        if (
          msg.includes('ECONNRESET') ||
          msg.includes('HPE_INVALID_') ||
          msg.includes('WebSocket')
        ) {
          try {
            socket.destroy();
          } catch {}
          return;
        }
      });

      // Handle server-level error events
      server.httpServer?.on('error', (err: any) => {
        const msg = String(err?.message || err || '');
        if (
          msg.includes('WebSocket') ||
          msg.includes('closed without opened')
        ) {
          return;
        }
        console.error('[vite-server error]', err);
      });

      // Connect middleware to smoothly respond to dead HMR pings
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (url.includes('__vite_ping') || url.includes('vite-hmr')) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Content-Type', 'text/plain');
          res.statusCode = 200;
          res.end('pong');
          return;
        }
        next();
      });
    },

    // Inject high-priority browser guard before @vite/client loads
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: 'script',
            attrs: { type: 'text/javascript' },
            children: `
              (function () {
                if (typeof window === 'undefined') return;
                var OrigWebSocket = window.WebSocket;
                if (OrigWebSocket) {
                  function isHmrUrl(url) {
                    var s = String(url || '');
                    return (
                      s.indexOf('vite-hmr') !== -1 ||
                      s.indexOf('localhost') !== -1 ||
                      s.indexOf(':3000') !== -1 ||
                      s.indexOf('run.app') !== -1 ||
                      s.indexOf('__vite') !== -1 ||
                      s.indexOf('aistudio') !== -1
                    );
                  }
                  function DummyHmrWebSocket(url) {
                    var self = this;
                    this.url = String(url || '');
                    this.readyState = 1;
                    this.protocol = '';
                    this.extensions = '';
                    this.bufferedAmount = 0;
                    this.binaryType = 'blob';
                    var listeners = {};
                    this.addEventListener = function (type, cb) {
                      if (!listeners[type]) listeners[type] = [];
                      listeners[type].push(cb);
                    };
                    this.removeEventListener = function (type, cb) {
                      if (!listeners[type]) return;
                      listeners[type] = listeners[type].filter(function (fn) { return fn !== cb; });
                    };
                    this.dispatchEvent = function (ev) {
                      var cbs = listeners[ev && ev.type] || [];
                      for (var i = 0; i < cbs.length; i++) {
                        try { cbs[i].call(self, ev); } catch (e) {}
                      }
                      return true;
                    };
                    this.send = function () {};
                    this.close = function () {
                      self.readyState = 3;
                    };
                    setTimeout(function () {
                      if (typeof self.onopen === 'function') {
                        try { self.onopen({ type: 'open' }); } catch (e) {}
                      }
                      self.dispatchEvent({ type: 'open' });
                    }, 10);
                  }
                  DummyHmrWebSocket.CONNECTING = 0;
                  DummyHmrWebSocket.OPEN = 1;
                  DummyHmrWebSocket.CLOSING = 2;
                  DummyHmrWebSocket.CLOSED = 3;
                  window.WebSocket = function (url, protocols) {
                    if (isHmrUrl(url)) {
                      return new DummyHmrWebSocket(url);
                    }
                    return new OrigWebSocket(url, protocols);
                  };
                  window.WebSocket.prototype = OrigWebSocket.prototype;
                  window.WebSocket.CONNECTING = 0;
                  window.WebSocket.OPEN = 1;
                  window.WebSocket.CLOSING = 2;
                  window.WebSocket.CLOSED = 3;
                }

                var isWsNoise = function (msg) {
                  var s = String(msg || '');
                  return (
                    s.indexOf('WebSocket closed without opened') !== -1 ||
                    s.indexOf('[vite] failed to connect to websocket') !== -1 ||
                    s.indexOf('failed to connect to websocket') !== -1 ||
                    s.indexOf('WebSocket connection to') !== -1
                  );
                };
                window.addEventListener('unhandledrejection', function (e) {
                  var reason = e && e.reason;
                  var msg = (reason && (reason.message || reason.stack)) || reason || '';
                  if (isWsNoise(msg)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);
                window.addEventListener('error', function (e) {
                  var msg = (e && (e.message || (e.error && e.error.message))) || '';
                  if (isWsNoise(msg)) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                  }
                }, true);
                var origError = console.error;
                console.error = function () {
                  var firstArg = arguments.length > 0 ? arguments[0] : '';
                  var combined = Array.prototype.map.call(arguments, function (a) { return a && a.message ? a.message : String(a); }).join(' ');
                  if (isWsNoise(firstArg) || isWsNoise(combined)) return;
                  return origError.apply(console, arguments);
                };
                var origWarn = console.warn;
                console.warn = function () {
                  var str = Array.prototype.join.call(arguments, ' ');
                  if (isWsNoise(str)) return;
                  return origWarn.apply(console, arguments);
                };
              })();
            `,
            injectTo: 'head-prepend',
          },
        ],
      };
    },
  };
}

export default defineConfig({
  customLogger,
  plugins: [react(), tailwindcss(), suppressWebSocketErrorsPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: false,
    watch: null,
  },
  base: './',
});