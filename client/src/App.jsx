import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Learn from './pages/Learn.jsx';
import TopicPage from './pages/TopicPage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import Playground from './pages/Playground.jsx';
import Blog from './pages/Blog.jsx';
import BlogPost from './pages/BlogPost.jsx';
import PostEditor from './pages/PostEditor.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Contact from './pages/Contact.jsx';
import About from './pages/About.jsx';
import Search from './pages/Search.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/:topic" element={<TopicPage />} />
          <Route path="/learn/:topic/:lesson" element={<LessonPage />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/posts/new" element={<ProtectedRoute admin><PostEditor /></ProtectedRoute>} />
          <Route path="/admin/posts/:slug/edit" element={<ProtectedRoute admin><PostEditor /></ProtectedRoute>} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
