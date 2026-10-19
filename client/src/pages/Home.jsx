import { Link } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import CodeBlock from '../components/CodeBlock.jsx';
import StageTrack from '../components/StageTrack.jsx';
import TopicCard from '../components/TopicCard.jsx';
import { SITE } from '../config.js';

const HERO_CODE = `const pipeline = ['install', 'lint', 'test', 'build', 'deploy'];

for (const step of pipeline) {
  console.log('running ' + step + ' ... ok');
}

console.log('Edit this code and run it again.');`;

export default function Home() {
  usePageTitle('');
  const stats = useFetch('/stats');
  const topics = useFetch('/topics');
  const posts = useFetch('/posts');

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Learn backend and DevOps by running the code.</h1>
          <p className="lead">
            A free roadmap from your first API to a deployed, monitored MERN app. Every lesson has
            examples you can edit and run in the browser, and your progress is saved when you sign up.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-lg" to="/learn/backend-fundamentals">Start with lesson one</Link>
            <Link className="btn btn-lg btn-ghost" to="/roadmap">See the roadmap</Link>
          </div>
          {stats.data && (
            <dl className="hero-stats">
              <div><dt>Topics</dt><dd>{stats.data.topics}</dd></div>
              <div><dt>Lessons</dt><dd>{stats.data.lessons}</dd></div>
              <div><dt>Blog posts</dt><dd>{stats.data.posts}</dd></div>
              <div><dt>Learners</dt><dd>{stats.data.learners}</dd></div>
            </dl>
          )}
        </div>
        <div className="hero-demo">
          <CodeBlock lang="js" code={HERO_CODE} run />
          <p className="small muted">This editor is real. Change the steps and press Run.</p>
        </div>
      </section>

      <section className="band">
        <div className="page">
          <h2>One path, four stages</h2>
          <p className="section-lead">Each stage ends with something you can show: a project, a pipeline, a live URL.</p>
          {topics.data && <StageTrack topics={topics.data} />}
        </div>
      </section>

      <section className="page">
        <h2>Pick a topic</h2>
        <div className="grid">
          {topics.loading && <p className="muted">Loading topics...</p>}
          {topics.error && <p className="form-error">{topics.error.message}</p>}
          {topics.data && topics.data.map((t) => <TopicCard key={t.slug} topic={t} />)}
        </div>
      </section>

      <section className="band">
        <div className="page">
          <div className="row-between">
            <h2>From the blog</h2>
            <Link to="/blog">All posts</Link>
          </div>
          <div className="grid grid-3">
            {posts.data && posts.data.slice(0, 3).map((p) => (
              <Link key={p._id} to={'/blog/' + p.slug} className="post-card">
                <span className="tags">{p.tags.slice(0, 2).join(' / ')}</span>
                <h3>{p.title}</h3>
                <p>{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page founder">
        <div>
          <h2>Built by {SITE.founder}</h2>
          <p>
            {SITE.name} started as a notebook of everything needed to go from writing APIs to running
            them in production. Questions, corrections and collaboration are welcome.
          </p>
        </div>
        <div className="founder-links">
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <a href={'mailto:' + SITE.email}>{SITE.email}</a>
          <Link to="/about">About the founder</Link>
        </div>
      </section>
    </>
  );
}
