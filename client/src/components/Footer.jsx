import { Link } from 'react-router-dom';
import { SITE } from '../config.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong className="footer-brand">{SITE.name}</strong>
          <p>{SITE.tagline}. Free to learn, built to be practiced.</p>
          <p className="muted small">&copy; {new Date().getFullYear()} {SITE.name}. Founded by {SITE.founder}.</p>
        </div>
        <div>
          <h3>Learn</h3>
          <ul>
            <li><Link to="/roadmap">Roadmap</Link></li>
            <li><Link to="/learn">All tutorials</Link></li>
            <li><Link to="/playground">Code playground</Link></li>
            <li><Link to="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3>Contact</h3>
          <ul>
            <li>{SITE.founder}, {SITE.founderRole}</li>
            <li><a href={SITE.phoneHref}>{SITE.phone}</a></li>
            <li><a href={'mailto:' + SITE.email}>{SITE.email}</a></li>
            <li><Link to="/contact">Send a message</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
