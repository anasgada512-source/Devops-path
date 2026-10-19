import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import usePageTitle from '../lib/usePageTitle.js';
import Markdown from '../components/Markdown.jsx';

const EMPTY = { title: '', excerpt: '', tags: '', content: '', published: true };

export default function PostEditor() {
  const { slug } = useParams();
  const editing = !!slug;
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [id, setId] = useState(null);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  usePageTitle(editing ? 'Edit post' : 'New post');

  useEffect(() => {
    if (!editing) return;
    api('/posts/' + slug)
      .then((p) => {
        setId(p._id);
        setForm({ title: p.title, excerpt: p.excerpt, tags: p.tags.join(', '), content: p.content, published: p.published });
      })
      .catch((e) => setError(e.message));
  }, [editing, slug]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const saved = editing
        ? await api('/posts/' + id, { method: 'PUT', body: form })
        : await api('/posts', { method: 'POST', body: form });
      navigate('/blog/' + saved.slug);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>{editing ? 'Edit post' : 'Write a post'}</h1>
      <form onSubmit={submit} className="form">
        <label>Title<input value={form.title} onChange={set('title')} required maxLength={140} /></label>
        <label>Short summary (shown on cards)<input value={form.excerpt} onChange={set('excerpt')} maxLength={300} /></label>
        <label>Tags (comma separated)<input value={form.tags} onChange={set('tags')} placeholder="docker, devops" /></label>

        <div className="row-between">
          <span className="label-text">Content</span>
          <button type="button" className="btn btn-quiet" onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
        </div>
        {preview ? (
          <div className="preview"><Markdown source={form.content} /></div>
        ) : (
          <textarea className="editor" rows={18} value={form.content} onChange={set('content')} required spellCheck />
        )}
        <p className="small muted">
          Formatting: ## Heading, **bold**, {'{{inline code}}'}, - list, 1. numbered list, &gt; tip, [text](https://link),
          and code blocks fenced with ~~~bash (use ~~~js run for a runnable JavaScript block).
        </p>

        <label className="check"><input type="checkbox" checked={form.published} onChange={set('published')} /> Published (untick to keep as a draft)</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Publish post'}</button>
      </form>
    </div>
  );
}
