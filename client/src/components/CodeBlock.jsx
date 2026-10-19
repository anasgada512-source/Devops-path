import { useState } from 'react';
import yaml from 'js-yaml';
import { runJS } from '../lib/runner.js';

const NAMES = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', json: 'JSON', yaml: 'YAML', yml: 'YAML',
  bash: 'Bash', sh: 'Shell', shell: 'Shell', sql: 'SQL', dockerfile: 'Dockerfile', hcl: 'Terraform',
  nginx: 'Nginx', ini: 'INI', text: 'Text', html: 'HTML', css: 'CSS',
};

function kindOf(lang) {
  const l = lang.toLowerCase();
  if (l === 'js' || l === 'javascript') return 'js';
  if (l === 'yaml' || l === 'yml') return 'yaml';
  if (l === 'json') return 'json';
  return null;
}

function validateYaml(text) {
  try {
    const docs = yaml.loadAll(text).filter((d) => d !== undefined && d !== null);
    const shown = docs.length === 1 ? docs[0] : docs;
    return {
      logs: [
        { type: 'ok', text: 'Valid YAML (' + docs.length + ' document' + (docs.length === 1 ? '' : 's') + ')' },
        { type: 'log', text: JSON.stringify(shown, null, 2) },
      ],
      error: null,
    };
  } catch (e) {
    const line = e.mark ? ' (line ' + (e.mark.line + 1) + ', column ' + (e.mark.column + 1) + ')' : '';
    return { logs: [], error: (e.reason || e.message) + line };
  }
}

function formatJson(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      logs: [
        { type: 'ok', text: 'Valid JSON' },
        { type: 'log', text: JSON.stringify(parsed, null, 2) },
      ],
      error: null,
    };
  } catch (e) {
    return { logs: [], error: e.message };
  }
}

export default function CodeBlock({ lang = 'text', code, run = false, big = false }) {
  const kind = kindOf(lang);
  const runnable = run && !!kind;

  const [value, setValue] = useState(code);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const actionLabel = kind === 'js' ? 'Run' : kind === 'yaml' ? 'Validate' : 'Format';

  async function execute() {
    if (busy) return;
    setBusy(true);
    if (kind === 'js') setResult(await runJS(value));
    else if (kind === 'yaml') setResult(validateYaml(value));
    else setResult(formatJson(value));
    setBusy(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      execute();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target;
      const { selectionStart: s, selectionEnd: en } = t;
      const next = value.slice(0, s) + '  ' + value.slice(en);
      setValue(next);
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2; });
    }
  }

  const rows = Math.min(big ? 26 : 18, Math.max(runnable ? 5 : 3, value.split('\n').length + 1));

  return (
    <figure className={'code' + (runnable ? ' code-run' : '')}>
      <figcaption>
        <span className="code-lang">{NAMES[lang.toLowerCase()] || lang}</span>
        <span className="code-actions">
          {runnable && value !== code && (
            <button type="button" onClick={() => { setValue(code); setResult(null); }}>Reset</button>
          )}
          <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
          {runnable && (
            <button type="button" className="code-run-btn" onClick={execute} disabled={busy}>
              {busy ? 'Running...' : actionLabel}
            </button>
          )}
        </span>
      </figcaption>

      {runnable ? (
        <textarea
          className="code-edit"
          value={value}
          rows={rows}
          spellCheck={false}
          aria-label={'Editable ' + (NAMES[lang.toLowerCase()] || lang) + ' code'}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      ) : (
        <pre tabIndex={0}><code>{code}</code></pre>
      )}

      {runnable && (
        <div className="code-out" role="status" aria-live="polite">
          {!result && <span className="muted">Press {actionLabel} (or Ctrl + Enter) to see the output.</span>}
          {result && result.logs.map((l, i) => (
            <pre key={i} className={'out-' + l.type}>{l.text}</pre>
          ))}
          {result && result.logs.length === 0 && !result.error && (
            <span className="muted">Ran with no output. Use console.log() to print values.</span>
          )}
          {result && result.error && <pre className="out-error">{result.error}</pre>}
        </div>
      )}
    </figure>
  );
}
