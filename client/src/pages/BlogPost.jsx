import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useFetch from '../lib/useFetch.js';
import usePageTitle from '../lib/usePageTitle.js';
import { api } from '../lib/api.js';
import Status from '../components/Status.jsx';
import Markdown from '../components/Markdown.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from './Blog.jsx';

export default function BlogPost() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch('/posts/' + slug);
  const [err, setErr] = useState('');
  usePageTitle(data ? data.title : 'Post');

  async function remove() {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api('/posts/' + data._id, { method: 'DELETE' });
      navigate('/blog');
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <Status loading={loading} error={error}>
      {data && (
        <article className="page narrow post">
          <p className="crumbs"><Link to="/blog">Blog</Link></p>
          <h1>{data.title}</h1>
          <p className="lesson-meta">
            By {data.authorName} &middot; {fmtDate(data.createdAt)} &middot; {data.tags.join(', ')}
          </p>
          {user?.role === 'admin' && (
            <p className="admin-bar">
              <Link className="btn btn-ghost" to={'/admin/posts/' + data.slug + '/edit'}>Edit</Link>
              <button className="btn btn-danger" onClick={remove}>Delete</button>
              {err && <span className="form-error">{err}</span>}
            </p>
          )}
          <Markdown key={data.slug} source={data.content} />
        </article>
      )}
    </Status>
  );
}
