import { useState } from 'react';
import usePageTitle from '../lib/usePageTitle.js';
import CodeBlock from '../components/CodeBlock.jsx';

const SAMPLES = {
  js: {
    label: 'JavaScript',
    hint: 'Runs in a sandboxed Web Worker in your browser. No network access, 4 second limit.',
    code: `// Exponential backoff: how long to wait between retries
function backoff(attempt, base = 200, max = 5000) {
  return Math.min(max, base * 2 ** attempt);
}

for (let attempt = 0; attempt < 6; attempt++) {
  console.log('retry ' + (attempt + 1) + ' after ' + backoff(attempt) + ' ms');
}`,
  },
  yaml: {
    label: 'YAML',
    hint: 'Validates Docker Compose, Kubernetes and GitHub Actions files and shows the parsed structure.',
    code: `services:
  web:
    image: nginx:1.27
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s`,
  },
  json: {
    label: 'JSON',
    hint: 'Checks syntax and pretty-prints. Handy for package.json, API responses and config files.',
    code: `{"name":"devops-roadmap","version":"1.0.0","scripts":{"start":"node server.js"},"engines":{"node":">=18"}}`,
  },
};

export default function Playground() {
  usePageTitle('Code playground');
  const [lang, setLang] = useState('js');
  const sample = SAMPLES[lang];

  return (
    <div className="page">
      <h1>Code playground</h1>
      <p className="section-lead">
        Try ideas without installing anything. Write JavaScript, or paste a YAML or JSON file to check it.
        Bash, SQL, Dockerfile and Terraform samples in the lessons are for copying into your own terminal.
      </p>

      <div className="tabs" role="tablist" aria-label="Language">
        {Object.entries(SAMPLES).map(([key, s]) => (
          <button
            key={key}
            role="tab"
            aria-selected={lang === key}
            className={lang === key ? 'on' : ''}
            onClick={() => setLang(key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="small muted">{sample.hint}</p>
      <CodeBlock key={lang} lang={lang} code={sample.code} run big />
      <p className="small muted">Tip: press Ctrl + Enter (or Cmd + Enter) to run without touching the mouse.</p>
    </div>
  );
}
