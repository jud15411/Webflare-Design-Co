import React, { useState, useEffect } from 'react';

interface PricingTier {
  _id?: string;
  name: string;
  price: string;
  frequency: 'monthly' | 'yearly' | 'one-time';
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tier: Omit<PricingTier, '_id' | 'features'> & { features: string }) => void;
  tier: PricingTier | null;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSave, tier }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    frequency: 'monthly' as PricingTier['frequency'],
    features: '',
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (tier) {
      setFormData({
        name: tier.name,
        price: tier.price,
        frequency: tier.frequency,
        features: tier.features.join('\n'),
        isFeatured: tier.isFeatured,
        isActive: tier.isActive,
      });
    } else {
      setFormData({
        name: '',
        price: '',
        frequency: 'monthly',
        features: '',
        isFeatured: false,
        isActive: true,
      });
    }
  }, [tier, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
        ...formData,
        features: formData.features,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{tier ? 'Edit Pricing Tier' : 'Add Pricing Tier'}</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Tier Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Price (e.g., $49 or Contact Us)</label>
                <input type="text" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleChange}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one-time">One-Time</option>
                </select>
            </div>
            <div className="form-group">
                <label>Features (one per line)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} required rows={6}></textarea>
            </div>
             <div className="form-group">
                <label>
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                    Featured Tier
                </label>
            </div>
            <div className="form-group">
                <label>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    Active on website
                </label>
            </div>
            <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                <button type="submit" className="save-button">{tier ? 'Save Changes' : 'Create Tier'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};