import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SITE } from '../config.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('dp_theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const close = () => setOpen(false);

  function onSearch(e) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    navigate('/search?q=' + encodeURIComponent(q.trim()));
    setQ('');
    close();
  }

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <svg width="26" height="26" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14" fill="var(--ink)" />
            <path d="M12 40h10l6-16 8 24 6-16h10" fill="none" stroke="var(--signal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{SITE.name}</span>
        </Link>

        <button className="nav-toggle" aria-expanded={open} aria-controls="nav-menu" onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>

        <nav id="nav-menu" className={'nav-menu' + (open ? ' open' : '')}>
          <NavLink to="/roadmap" onClick={close}>Roadmap</NavLink>
          <NavLink to="/learn" onClick={close}>Tutorials</NavLink>
          <NavLink to="/playground" onClick={close}>Playground</NavLink>
          <NavLink to="/blog" onClick={close}>Blog</NavLink>
          <NavLink to="/contact" onClick={close}>Contact</NavLink>

          <form className="nav-search" onSubmit={onSearch} role="search">
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search lessons"
              aria-label="Search lessons"
            />
          </form>

          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme'}
            title="Toggle theme"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          {user ? (
            <span className="nav-user">
              <NavLink to="/dashboard" onClick={close}>{user.name.split(' ')[0]}</NavLink>
              <button className="btn btn-quiet" onClick={() => { logout(); close(); navigate('/'); }}>Log out</button>
            </span>
          ) : (
            <span className="nav-user">
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link className="btn" to="/register" onClick={close}>Sign up free</Link>
            </span>
          )}
        </nav>
      </div>
    </header>
  );
}
