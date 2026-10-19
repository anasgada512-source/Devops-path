import { Link } from 'react-router-dom';
import usePageTitle from '../lib/usePageTitle.js';
import { SITE } from '../config.js';

export default function About() {
  usePageTitle('About');
  return (
    <div className="page narrow">
      <h1>About {SITE.name}</h1>
      <p className="section-lead">
        A free, practical path for developers who want to move from writing backend code to running it
        in production.
      </p>

      <h2>Why it exists</h2>
      <p>
        Most learning resources teach one tool at a time. Real jobs ask you to connect them: an API,
        a database, a container, a pipeline, a cloud server, a dashboard. {SITE.name} keeps the whole
        chain in one place, in the order that makes each step easier than the last, and lets you run
        the examples as you read.
      </p>

      <h2>The founder</h2>
      <div className="card founder-card">
        <strong className="founder-name">{SITE.founder}</strong>
        <span className="muted">{SITE.founderRole} of {SITE.name}</span>
        <p><a href={SITE.phoneHref}>{SITE.phone}</a><br /><a href={'mailto:' + SITE.email}>{SITE.email}</a></p>
      </div>

      <h2>How this site is built</h2>
      <p>
        It is a MERN application: React on the frontend, Node.js and Express for the API, MongoDB for
        the data, and JWT for login. The same site is packaged with Docker, built by a GitHub Actions
        pipeline and deployed with environment-based configuration, which is exactly what the lessons
        teach.
      </p>

      <p><Link className="btn" to="/roadmap">See the roadmap</Link> <Link className="btn btn-ghost" to="/contact">Get in touch</Link></p>
    </div>
  );
}
