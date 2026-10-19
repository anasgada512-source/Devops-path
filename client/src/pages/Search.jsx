import { Link, useSearchParams } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';

export default function Search() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  usePageTitle('Search: ' + q);
  const { data, loading, error } = useFetch(q.length >= 2 ? '/topics/search/all?q=' + encodeURIComponent(q) : null);

  return (
    <div className="page narrow">
      <h1>Search results</h1>
      <p className="muted">Showing lessons that mention "{q}"</p>
      {q.length < 2 && <p>Type at least two characters in the search box.</p>}
      {loading && q.length >= 2 && <p className="muted">Searching...</p>}
      {error && <p className="form-error">{error.message}</p>}
      {data && data.length === 0 && <p>Nothing found. Try a broader word such as "docker" or "api".</p>}
      <ul className="results">
        {data && data.map((r) => (
          <li key={r.topic + r.lesson}>
            <Link to={'/learn/' + r.topic + '/' + r.lesson}>
              <strong>{r.title}</strong>
              <small>{r.topicTitle}</small>
              <span>{r.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
