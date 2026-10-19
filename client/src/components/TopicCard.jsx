import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopicCard({ topic }) {
  const { user, completed } = useAuth();
  const done = user ? completed.filter((c) => c.topic === topic.slug).length : 0;
  const pct = topic.lessonCount ? Math.round((done / topic.lessonCount) * 100) : 0;

  return (
    <Link to={'/learn/' + topic.slug} className="topic-card">
      <span className="topic-icon" aria-hidden="true">{topic.icon}</span>
      <h3>{topic.title}</h3>
      <p>{topic.description}</p>
      <span className="topic-meta">
        {topic.lessonCount} lessons &middot; about {topic.minutes} min
        {user && <> &middot; {pct}% done</>}
      </span>
      {user && (
        <span className="bar" aria-hidden="true"><span style={{ width: pct + '%' }} /></span>
      )}
    </Link>
  );
}
