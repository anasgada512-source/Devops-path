import { Link, useParams } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import Status from '../components/Status.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopicPage() {
  const { topic } = useParams();
  const { data, loading, error } = useFetch('/topics/' + topic);
  const { isDone } = useAuth();
  usePageTitle(data ? data.title : 'Topic');

  return (
    <Status loading={loading} error={error}>
      {data && (
        <div className="page narrow">
          <p className="crumbs"><Link to="/learn">Tutorials</Link> / {data.title}</p>
          <h1><span aria-hidden="true">{data.icon}</span> {data.title}</h1>
          <p className="section-lead">{data.description}</p>

          <h2>What you will be able to do</h2>
          <ul className="checks">
            {data.outcomes.map((o) => <li key={o}>{o}</li>)}
          </ul>

          <h2>Lessons</h2>
          <ol className="lesson-list">
            {data.lessons.map((l) => (
              <li key={l.slug}>
                <Link to={'/learn/' + data.slug + '/' + l.slug}>
                  <span className={'tick' + (isDone(data.slug, l.slug) ? ' on' : '')} aria-label={isDone(data.slug, l.slug) ? 'Completed' : 'Not completed'}>
                    {isDone(data.slug, l.slug) ? '✓' : ''}
                  </span>
                  <span>
                    <strong>{l.title}</strong>
                    <small>{l.summary}</small>
                  </span>
                  <em>{l.minutes} min</em>
                </Link>
              </li>
            ))}
          </ol>
          <Link className="btn" to={'/learn/' + data.slug + '/' + data.lessons[0].slug}>Start this topic</Link>
        </div>
      )}
    </Status>
  );
}
