import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import Status from '../components/Status.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Blog() {
  usePageTitle('Blog');
  const { user } = useAuth();
  const { data, loading, error } = useFetch('/posts');
  const [tag, setTag] = useState('');
  const [q, setQ] = useState('');

  const tags = useMemo(() => [...new Set((data || []).flatMap((p) => p.tags))].sort(), [data]);
  const shown = useMemo(
    () =>
      (data || []).filter(
        (p) =>
          (!tag || p.tags.includes(tag)) &&
          (!q || (p.title + ' ' + p.excerpt + ' ' + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase()))
      ),
    [data, tag, q]
  );

  return (
    <Status loading={loading} error={error}>
      <div className="page">
        <div className="row-between">
          <h1>Blog</h1>
          {user?.role === 'admin' && <Link className="btn" to="/admin/posts/new">Write a post</Link>}
        </div>
        <p className="section-lead">Guides, checklists and plans for becoming a backend and DevOps engineer.</p>

        <div className="filters">
          <input
            type="search"
            placeholder="Search posts"
            aria-label="Search posts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="chips" role="group" aria-label="Filter by tag">
            <button className={!tag ? 'on' : ''} onClick={() => setTag('')}>All</button>
            {tags.map((t) => (
              <button key={t} className={tag === t ? 'on' : ''} onClick={() => setTag(tag === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-3">
          {shown.map((p) => (
            <Link key={p._id} to={'/blog/' + p.slug} className="post-card">
              <span className="tags">
                {p.tags.slice(0, 3).join(' / ')}
                {!p.published && ' (draft)'}
              </span>
              <h2>{p.title}</h2>
              <p>{p.excerpt}</p>
              <span className="small muted">{p.authorName} &middot; {fmtDate(p.createdAt)}</span>
            </Link>
          ))}
        </div>
        {data && shown.length === 0 && <p className="muted">No posts match. Clear the search or pick another tag.</p>}
      </div>
    </Status>
  );
}
