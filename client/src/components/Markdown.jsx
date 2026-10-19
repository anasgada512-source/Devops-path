import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock.jsx';

// Renders the small lesson/blog markup safely (no dangerouslySetInnerHTML anywhere).
// Supports: ## headings, **bold**, `code` or {{code}}, [links](url), - lists, 1. lists,
// > tips, | tables |, and fenced code blocks (~~~lang or ```lang, add "run" to make it editable).

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\{\{[^}]+\}\}|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text, prefix) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    const key = prefix + '-' + i;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2)
      return <code key={key}>{part.slice(1, -1)}</code>;
    if (part.startsWith('{{') && part.endsWith('}}')) return <code key={key}>{part.slice(2, -2)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) return <Link key={key} to={href}>{label}</Link>;
      if (/^(https?:\/\/|mailto:)/.test(href))
        return <a key={key} href={href} target="_blank" rel="noopener noreferrer">{label}</a>;
      return label;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

const STARTS_BLOCK = /^(#{2,4}\s|>|\s*[-*]\s|\s*\d+\.\s|~~~|```|\|)/;

export function parse(src) {
  const lines = String(src || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(/^(~~~|```)\s*([\w+-]*)\s*(.*)$/);
    if (fence) {
      const [, mark, lang, flags] = fence;
      const buf = [];
      i++;
      while (i < lines.length && !lines[i].startsWith(mark)) buf.push(lines[i++]);
      i++; // closing fence
      blocks.push({ type: 'code', lang: lang || 'text', run: /\brun\b/.test(flags), code: buf.join('\n') });
      continue;
    }

    if (/^\s*$/.test(line)) { i++; continue; }

    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { blocks.push({ type: 'h', level: h[1].length, text: h[2] }); i++; continue; }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      blocks.push({ type: 'quote', text: buf.join(' ') });
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      blocks.push({ type: 'ol', items });
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i++].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      }
      const header = rows[0];
      const body = rows.slice(1).filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c)));
      blocks.push({ type: 'table', header, body });
      continue;
    }

    const buf = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !STARTS_BLOCK.test(lines[i])) buf.push(lines[i++]);
    if (buf.length === 0) { buf.push(lines[i++]); } // safety: never loop forever
    blocks.push({ type: 'p', text: buf.join(' ') });
  }
  return blocks;
}

export default function Markdown({ source }) {
  const blocks = useMemo(() => parse(source), [source]);

  return (
    <div className="prose">
      {blocks.map((b, n) => {
        const key = 'b' + n;
        switch (b.type) {
          case 'h': {
            const Tag = 'h' + b.level;
            return <Tag key={key}>{inline(b.text, key)}</Tag>;
          }
          case 'p':
            return <p key={key}>{inline(b.text, key)}</p>;
          case 'quote':
            return <blockquote key={key}>{inline(b.text, key)}</blockquote>;
          case 'ul':
            return (
              <ul key={key}>
                {b.items.map((t, j) => <li key={j}>{inline(t, key + j)}</li>)}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key}>
                {b.items.map((t, j) => <li key={j}>{inline(t, key + j)}</li>)}
              </ol>
            );
          case 'table':
            return (
              <div className="table-wrap" key={key}>
                <table>
                  <thead>
                    <tr>{b.header.map((c, j) => <th key={j}>{inline(c, key + 'h' + j)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.body.map((r, j) => (
                      <tr key={j}>{r.map((c, k) => <td key={k}>{inline(c, key + j + '-' + k)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'code':
            return <CodeBlock key={key} lang={b.lang} code={b.code} run={b.run} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
