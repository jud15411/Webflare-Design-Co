import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface Article {
  _id: string;
  title: string;
  content: string;
  section: string;
  status: 'Draft' | 'Published';
}

interface EditArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onArticleUpdated: () => void;
  articleSections: string[];
}

const EditArticleModal = ({
  article,
  onClose,
  onArticleUpdated,
  articleSections,
}: EditArticleModalProps) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [section, setSection] = useState(
    article?.section || articleSections[0]
  );
  const [status, setStatus] = useState(article?.status || 'Published');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setSection(article.section);
      setStatus(article.status);
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !token) return;

    setIsSaving(true);
    setError('');

    try {
      await axios.put(
        `/api/v1/articles/${article._id}`,
        { title, content, section, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onArticleUpdated();
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to update article. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!article) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Article</h2>
        <form onSubmit={handleSubmit} className="kb-form">
          <div className="form-group">
            <label htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              placeholder="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-section">Section</label>
            <select
              id="edit-section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              required>
              {articleSections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="edit-content">Content</label>
            <textarea
              id="edit-content"
              placeholder="Write your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-status">Status</label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as 'Draft' | 'Published')
              }
              required>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          {error && <p className="kb-error">{error}</p>}
          <div className="modal-actions">
            <button type="submit" className="kb-btn-submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="kb-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticleModal;
