import React, { useState, useEffect } from 'react';

interface PortfolioItem {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  category: 'Web Development' | 'Cybersecurity' | 'Consulting';
  isActive: boolean;
}

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PortfolioItem, '_id'>) => void;
  item: PortfolioItem | null;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ isOpen, onClose, onSave, item }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    category: 'Web Development' as PortfolioItem['category'],
    isActive: true,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        projectUrl: item.projectUrl || '',
        category: item.category,
        isActive: item.isActive,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        projectUrl: '',
        category: 'Web Development',
        isActive: true,
      });
    }
  }, [item, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}></textarea>
            </div>
            <div className="form-group">
                <label>Image URL</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Project URL (Optional)</label>
                <input type="text" name="projectUrl" value={formData.projectUrl} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="Web Development">Web Development</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Consulting">Consulting</option>
                </select>
            </div>
            <div className="form-group">
                <label>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    Active on website
                </label>
            </div>
            <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-button">{item ? 'Save Changes' : 'Create Item'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};