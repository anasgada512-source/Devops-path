import { Link } from 'react-router-dom';
import { STAGES } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

// The signature element: a pipeline track where each stage is a node and topics hang off it.
export default function StageTrack({ topics, detailed = false }) {
  const { user, completed } = useAuth();
  const stages = [1, 2, 3, 4].map((n) => ({
    n,
    ...STAGES[n],
    topics: topics.filter((t) => t.stage === n),
  }));

  return (
    <ol className={'track' + (detailed ? ' track-detailed' : '')}>
      {stages.map((s) => {
        const total = s.topics.reduce((a, t) => a + t.lessonCount, 0);
        const done = user
          ? completed.filter((c) => s.topics.some((t) => t.slug === c.topic)).length
          : 0;
        const state = user && total && done === total ? 'done' : user && done > 0 ? 'active' : '';
        return (
          <li key={s.n} className={'track-stage ' + state}>
            <span className="track-node" aria-hidden="true">{state === 'done' ? '✓' : s.n}</span>
            <div className="track-body">
              <h3>Stage {s.n}: {s.name}</h3>
              <p>{s.blurb}</p>
              {detailed && <p className="track-project">{s.project}</p>}
              {user && <p className="small muted">{done} of {total} lessons complete</p>}
              <ul className="track-topics">
                {s.topics.map((t) => (
                  <li key={t.slug}>
                    <Link to={'/learn/' + t.slug}>
                      <span aria-hidden="true">{t.icon}</span> {t.title}
                      {detailed && <small>{t.lessonCount} lessons</small>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
