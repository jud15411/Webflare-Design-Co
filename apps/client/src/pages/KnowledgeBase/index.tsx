import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth context
import './KnowledgeBase.css';

interface Article {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  role: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const KnowledgeBasePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth(); // Get authToken from context

  const fetchArticles = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/v1/articles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setArticles(data);
    } catch (err) {
      setError('Failed to fetch articles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchArticles();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${API_URL}/api/v1/articles`,
        {
          title: newTitle,
          content: newContent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewTitle('');
      setNewContent('');
      fetchArticles(); // Refresh the list of articles
    } catch (err) {
      setError('Failed to create article. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="kb-container">
      <header className="kb-header">
        <h1>Knowledge Base</h1>
        <p>A repository of company articles and guides.</p>
      </header>

      <div className="kb-content">
        <section className="kb-create-article">
          <h2>Create a New Article</h2>
          <form onSubmit={handleSubmit} className="kb-form">
            <input
              type="text"
              placeholder="Article Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your article content here..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              required></textarea>
            {error && <p className="kb-error">{error}</p>}
            <button type="submit" className="kb-btn-submit">
              Publish Article
            </button>
          </form>
        </section>

        <section className="kb-article-list">
          <h2>Published Articles</h2>
          {loading ? (
            <div className="kb-loading">Loading articles...</div>
          ) : articles.length > 0 ? (
            <div className="kb-articles-grid">
              {articles.map((article) => (
                <div key={article._id} className="kb-article-card">
                  <h3>{article.title}</h3>
                  <p className="kb-article-meta">
                    by {article.authorName} ({article.role}) on{' '}
                    {new Date(article.createdAt).toLocaleDateString()}
                  </p>
                  <div className="kb-article-content">
                    <p>{article.content.substring(0, 150)}...</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kb-no-articles">No articles published yet.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
