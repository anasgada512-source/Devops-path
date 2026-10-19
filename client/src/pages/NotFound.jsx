import { Link } from 'react-router-dom';
import usePageTitle from '../lib/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="page narrow">
      <h1>404: this route does not exist</h1>
      <p>The link may be old or mistyped. Try one of these:</p>
      <p>
        <Link className="btn" to="/learn">Browse tutorials</Link>{' '}
        <Link className="btn btn-ghost" to="/">Go home</Link>
      </p>
    </div>
  );
}
