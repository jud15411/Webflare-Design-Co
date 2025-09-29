import React, { useState, useEffect } from 'react';

interface Service {
  _id?: string;
  name: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Omit<Service, '_id'>) => void;
  service: Service | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, onSave, service }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        icon: service.icon || '',
        isActive: service.isActive,
      });
    } else {
      setFormData({ name: '', description: '', icon: '', isActive: true });
    }
  }, [service, isOpen]);

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
        <h2>{service ? 'Edit Service' : 'Add New Service'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Service Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={4}></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="icon">Icon (e.g., FontAwesome class)</label>
            <input type="text" name="icon" value={formData.icon} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
              Active on website
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-button">{service ? 'Save Changes' : 'Create Service'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};