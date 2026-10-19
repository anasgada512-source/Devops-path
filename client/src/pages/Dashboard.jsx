import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import { api } from '../lib/api.js';
import usePageTitle from '../lib/usePageTitle.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from './Blog.jsx';

export default function Dashboard() {
  usePageTitle('My dashboard');
  const { user, completed } = useAuth();
  const { data: topics } = useFetch('/topics');
  const [messages, setMessages] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') api('/contact').then(setMessages).catch(() => setMessages([]));
  }, [user]);

  const totalLessons = topics ? topics.reduce((n, t) => n + t.lessonCount, 0) : 0;
  const pct = totalLessons ? Math.round((completed.length / totalLessons) * 100) : 0;

  // first lesson not yet completed, in curriculum order
  let next = null;
  if (topics) {
    for (const t of topics) {
      const l = t.lessons.find((x) => !completed.some((c) => c.topic === t.slug && c.lesson === x.slug));
      if (l) { next = { topic: t, lesson: l }; break; }
    }
  }

  return (
    <div className="page">
      <h1>Hi, {user.name.split(' ')[0]}</h1>

      <div className="dash-grid">
        <section className="card">
          <h2>Your account</h2>
          <dl className="kv">
            <dt>User ID</dt><dd><code>{user.userId}</code></dd>
            <dt>Name</dt><dd>{user.name}</dd>
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Role</dt><dd>{user.role}</dd>
            <dt>Joined</dt><dd>{fmtDate(user.createdAt)}</dd>
          </dl>
        </section>

        <section className="card">
          <h2>Overall progress</h2>
          <p className="big-number">{pct}%</p>
          <span className="bar" aria-hidden="true"><span style={{ width: pct + '%' }} /></span>
          <p className="muted">{completed.length} of {totalLessons} lessons complete</p>
          {next ? (
            <Link className="btn" to={'/learn/' + next.topic.slug + '/' + next.lesson.slug}>
              Continue: {next.lesson.title}
            </Link>
          ) : topics ? <p>You finished every lesson. Time to build and write about it.</p> : null}
        </section>
      </div>

      <h2>By topic</h2>
      <div className="topic-progress">
        {topics && topics.map((t) => {
          const done = completed.filter((c) => c.topic === t.slug).length;
          const p = Math.round((done / t.lessonCount) * 100);
          return (
            <Link key={t.slug} to={'/learn/' + t.slug} className="tp-row">
              <span><span aria-hidden="true">{t.icon}</span> {t.title}</span>
              <span className="bar" aria-hidden="true"><span style={{ width: p + '%' }} /></span>
              <span className="small muted">{done}/{t.lessonCount}</span>
            </Link>
          );
        })}
      </div>

      {user.role === 'admin' && (
        <section className="admin-panel">
          <div className="row-between">
            <h2>Admin</h2>
            <Link className="btn" to="/admin/posts/new">Write a blog post</Link>
          </div>
          <h3>Contact messages</h3>
          {messages === null && <p className="muted">Loading...</p>}
          {messages && messages.length === 0 && <p className="muted">No messages yet.</p>}
          <ul className="messages">
            {messages && messages.map((m) => (
              <li key={m._id}>
                <strong>{m.name}</strong> <span className="muted small">{fmtDate(m.createdAt)}</span>
                <div className="small">
                  <a href={'mailto:' + m.email}>{m.email}</a>
                  {m.phone && <> &middot; <a href={'tel:' + m.phone}>{m.phone}</a></>}
                </div>
                <p>{m.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
