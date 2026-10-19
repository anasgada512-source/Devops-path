// Runs JavaScript in a Web Worker with a time limit.
export function runJS(code, timeout = 4000) {
  return new Promise((resolve) => {
    let worker = null;
    let done = false;
    let timer = null;

    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (worker) worker.terminate();
      resolve(result);
    };

    timer = setTimeout(
      () => finish({ logs: [], error: 'Timed out after ' + timeout / 1000 + 's. Is there an infinite loop?' }),
      timeout
    );

    try {
      worker = new Worker('/runner-worker.js');
    } catch (e) {
      return finish({ logs: [], error: 'Could not start the code runner: ' + e.message });
    }
    worker.onmessage = (e) => finish(e.data);
    worker.onerror = (e) => finish({ logs: [], error: e.message || 'The code runner crashed.' });
    worker.postMessage({ code });
  });
}
