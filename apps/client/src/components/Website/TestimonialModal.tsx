import React, { useState, useEffect } from 'react';

interface Testimonial {
  _id?: string;
  authorName: string;
  authorCompany: string;
  quote: string;
  imageUrl?: string;
  isActive: boolean;
}

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonial: Omit<Testimonial, '_id'>) => void;
  testimonial: Testimonial | null;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({ isOpen, onClose, onSave, testimonial }) => {
  const [formData, setFormData] = useState({
    authorName: '',
    authorCompany: '',
    quote: '',
    imageUrl: '',
    isActive: true,
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        authorName: testimonial.authorName,
        authorCompany: testimonial.authorCompany,
        quote: testimonial.quote,
        imageUrl: testimonial.imageUrl || '',
        isActive: testimonial.isActive,
      });
    } else {
      setFormData({
        authorName: '',
        authorCompany: '',
        quote: '',
        imageUrl: '',
        isActive: true,
      });
    }
  }, [testimonial, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        <h2>{testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Author Name</label>
                <input type="text" name="authorName" value={formData.authorName} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Author's Company</label>
                <input type="text" name="authorCompany" value={formData.authorCompany} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Quote</label>
                <textarea name="quote" value={formData.quote} onChange={handleChange} required rows={5}></textarea>
            </div>
            <div className="form-group">
                <label>Author Image URL (Optional)</label>
                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    Active on website
                </label>
            </div>
            <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-button">{testimonial ? 'Save Changes' : 'Create Testimonial'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};