import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import Status from '../components/Status.jsx';
import TopicCard from '../components/TopicCard.jsx';
import { STAGES } from '../config.js';

export default function Learn() {
  usePageTitle('Tutorials');
  const { data, loading, error } = useFetch('/topics');

  return (
    <Status loading={loading} error={error}>
      {data && (
        <div className="page">
          <h1>Tutorials</h1>
          <p className="section-lead">
            {data.length} topics, {data.reduce((n, t) => n + t.lessonCount, 0)} lessons. Every code sample can be copied, and
            JavaScript, YAML and JSON samples can be edited and run right on the page.
          </p>
          {[1, 2, 3, 4].map((n) => (
            <section key={n} className="stage-section">
              <h2>Stage {n}: {STAGES[n].name}</h2>
              <div className="grid">
                {data.filter((t) => t.stage === n).map((t) => <TopicCard key={t.slug} topic={t} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </Status>
  );
}
