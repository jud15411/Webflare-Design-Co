import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import './KnowledgeBase.css';
import EditArticleModal from '../../components/Articles/EditArticleModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

interface Article {
  _id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  section: string;
  status: 'Draft' | 'Published';
}

type GroupedArticles = Record<string, Article[]>;

const articleSections = ['Onboarding', 'General', 'Technical', 'Policy'];

const KnowledgeBasePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSection, setNewSection] = useState(articleSections[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [articleToDeleteId, setArticleToDeleteId] = useState<string | null>(
    null
  );
  const { token } = useAuth();

  const fetchArticles = async () => {
    try {
      setError('');
      setLoading(true);
      const { data } = await axios.get(`/api/v1/articles`, {
        headers: { Authorization: `Bearer ${token}` },
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
        `/api/v1/articles`,
        { title: newTitle, content: newContent, section: newSection },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTitle('');
      setNewContent('');
      setNewSection(articleSections[0]);
      fetchArticles();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to create article. Please try again.';
      setError(errorMessage);
      console.error(err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setArticleToDeleteId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDeleteId) return;

    try {
      setError('');
      await axios.delete(`/api/v1/articles/${articleToDeleteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
    } catch (err) {
      setError('Failed to delete article.');
      console.error(err);
    } finally {
      setIsConfirmModalOpen(false);
      setArticleToDeleteId(null);
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingArticle(null);
  };

  const groupedArticles = articles.reduce((acc, article) => {
    const section = article.section || 'General';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(article);
    return acc;
  }, {} as GroupedArticles);

  return (
    <div className="kb-page-container">
      <header className="kb-header">
        <h1>Knowledge Base</h1>
        <p>A central repository for all company documentation and guides.</p>
      </header>

      <div className="kb-layout">
        <section className="kb-create-article-card">
          <h2>Create New Article</h2>
          <form onSubmit={handleSubmit} className="kb-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                placeholder="Article Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="section">Section</label>
              <select
                id="section"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                required>
                {articleSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                placeholder="Write your article content here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              />
            </div>
            {error && <p className="kb-error">{error}</p>}
            <button type="submit" className="kb-btn-submit">
              Publish Article
            </button>
          </form>
        </section>

        <section className="kb-article-list-card">
          <h2>Company Articles</h2>
          {loading ? (
            <div className="kb-loading">Loading articles...</div>
          ) : articles.length > 0 ? (
            Object.keys(groupedArticles).map((section) => (
              <div key={section} className="kb-section">
                <h3>{section}</h3>
                <div className="kb-articles-grid">
                  {groupedArticles[section].map((article) => (
                    <div key={article._id} className="kb-article-card">
                      <h4>
                        {article.title}
                        {article.status === 'Draft' && (
                          <span className="draft-tag">(Draft)</span>
                        )}
                      </h4>
                      <p className="kb-article-meta">
                        By {article.authorName} on{' '}
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      <div className="kb-article-content">
                        <p>{article.content}</p>
                      </div>
                      <div className="kb-article-actions">
                        <button
                          className="kb-btn-edit"
                          onClick={() => handleEditArticle(article)}>
                          Edit
                        </button>
                        <button
                          className="kb-btn-delete"
                          onClick={() => handleDeleteClick(article._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="kb-no-articles">
              No articles have been published yet.
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <EditArticleModal
          article={editingArticle}
          onClose={closeModal}
          onArticleUpdated={fetchArticles}
          articleSections={articleSections}
        />
      )}

      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message="Are you sure you want to permanently delete this article?"
          confirmText="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};

export default KnowledgeBasePage;
