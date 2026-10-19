// Runs learner code inside a Web Worker so it can never touch the page,
// cookies or localStorage. The server serves this file with a CSP that blocks network access.
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

function format(value) {
  if (typeof value === 'string') return value;
  if (value === undefined) return 'undefined';
  if (value instanceof Error) return value.name + ': ' + value.message;
  try {
    return JSON.stringify(
      value,
      (key, v) => {
        if (v instanceof Map) return { Map: Array.from(v.entries()) };
        if (v instanceof Set) return { Set: Array.from(v.values()) };
        if (typeof v === 'function') return '[Function]';
        if (typeof v === 'bigint') return v.toString();
        return v;
      },
      2
    );
  } catch (e) {
    return String(value);
  }
}

self.onmessage = async (event) => {
  const logs = [];
  const push = (type) => (...args) => logs.push({ type, text: args.map(format).join(' ') });
  const fakeConsole = { log: push('log'), info: push('log'), warn: push('warn'), error: push('error') };

  let error = null;
  try {
    const fn = new AsyncFunction('console', '"use strict";\n' + event.data.code);
    await fn(fakeConsole);
  } catch (e) {
    error = e && e.message ? e.name + ': ' + e.message : String(e);
  }
  self.postMessage({ logs: logs.slice(0, 500), error });
};
