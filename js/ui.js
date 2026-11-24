// Tiny DOM + platform helpers shared by both pages.
export const $ = (s) => document.querySelector(s);
export const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  el.append(...kids.flat(Infinity).filter((x) => x != null && x !== false));
  return el;
}

export const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

export function initTheme(btn) {
  const order = ['auto', 'dark', 'light'];
  let t = store.get('detonatr-theme') ?? 'auto';
  const apply = () => {
    if (t === 'auto') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
    btn.textContent = { auto: '◐', dark: '☾', light: '☀' }[t];
    btn.setAttribute('aria-label', `Theme: ${t}`);
  };
  btn.addEventListener('click', () => { t = order[(order.indexOf(t) + 1) % 3]; store.set('detonatr-theme', t); apply(); });
  apply();
}

export function registerSW() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}
