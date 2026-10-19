import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import Status from '../components/Status.jsx';
import StageTrack from '../components/StageTrack.jsx';

export default function Roadmap() {
  usePageTitle('Backend and DevOps roadmap');
  const { data, loading, error } = useFetch('/topics');

  return (
    <Status loading={loading} error={error}>
      {data && (
        <div className="page">
          <h1>Backend and DevOps engineer roadmap</h1>
          <p className="section-lead">
            Follow the stages in order. Each topic links to lessons with examples, and each stage ends
            with a project so you always have something to show in an interview.
          </p>
          <StageTrack topics={data} detailed />
          <aside className="note">
            <strong>How long does it take?</strong> With about ten hours a week, most learners finish
            the four stages in six to nine months. Speed matters less than building the projects.
          </aside>
        </div>
      )}
    </Status>
  );
}
