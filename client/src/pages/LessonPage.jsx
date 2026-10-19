import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import Status from '../components/Status.jsx';
import Markdown from '../components/Markdown.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LessonPage() {
  const { topic, lesson } = useParams();
  const location = useLocation();
  const { user, isDone, setLessonDone } = useAuth();
  const { data, loading, error } = useFetch('/topics/' + topic + '/lessons/' + lesson);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [menu, setMenu] = useState(false);
  usePageTitle(data ? data.lesson.title : 'Lesson');

  async function toggle() {
    setSaving(true);
    setSaveError('');
    try {
      await setLessonDone(topic, lesson, !isDone(topic, lesson));
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Status loading={loading} error={error}>
      {data && (
        <div className="lesson-layout">
          <aside className={'lesson-side' + (menu ? ' open' : '')}>
            <button className="side-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu}>
              {data.topic.title}: lessons {menu ? '(hide)' : '(show)'}
            </button>
            <div className="side-list">
              <Link to={'/learn/' + data.topic.slug} className="side-title">
                <span aria-hidden="true">{data.topic.icon}</span> {data.topic.title}
              </Link>
              <ul>
                {data.topic.lessons.map((l) => (
                  <li key={l.slug}>
                    <Link
                      to={'/learn/' + data.topic.slug + '/' + l.slug}
                      className={l.slug === lesson ? 'current' : ''}
                      aria-current={l.slug === lesson ? 'page' : undefined}
                      onClick={() => setMenu(false)}
                    >
                      <span className={'tick' + (isDone(data.topic.slug, l.slug) ? ' on' : '')}>{isDone(data.topic.slug, l.slug) ? '✓' : ''}</span>
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link to="/learn" className="side-all">All topics</Link>
            </div>
          </aside>

          <article className="lesson">
            <p className="crumbs">
              <Link to="/learn">Tutorials</Link> / <Link to={'/learn/' + data.topic.slug}>{data.topic.title}</Link>
            </p>
            <h1>{data.lesson.title}</h1>
            <p className="lesson-meta">
              {data.lesson.minutes} min read &middot; lesson {data.position.current} of {data.position.total}
            </p>

            <Markdown key={topic + '/' + lesson} source={data.lesson.content} />

            <div className="lesson-done">
              {user ? (
                <button className={'btn' + (isDone(topic, lesson) ? ' btn-ghost' : '')} onClick={toggle} disabled={saving}>
                  {isDone(topic, lesson) ? 'Completed. Mark as not done' : 'Mark lesson complete'}
                </button>
              ) : (
                <p>
                  <Link to="/login" state={{ from: location.pathname }}>Log in</Link> or{' '}
                  <Link to="/register">create a free account</Link> to save your progress.
                </p>
              )}
              {saveError && <p className="form-error">{saveError}</p>}
            </div>

            <nav className="pager" aria-label="Lesson navigation">
              {data.prev ? (
                <Link to={'/learn/' + data.prev.topic + '/' + data.prev.lesson}>
                  <small>Previous</small>
                  {data.prev.title}
                </Link>
              ) : <span />}
              {data.next ? (
                <Link to={'/learn/' + data.next.topic + '/' + data.next.lesson} className="next">
                  <small>Next</small>
                  {data.next.title}
                </Link>
              ) : <span />}
            </nav>
          </article>
        </div>
      )}
    </Status>
  );
}
