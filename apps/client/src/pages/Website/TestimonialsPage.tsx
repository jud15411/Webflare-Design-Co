import { useState, useEffect } from 'react';
import API from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { TestimonialModal } from '../../components/Website/TestimonialModal';
import { ConfirmationModal } from '../../components/Common/ConfirmationModal/ConfirmationModal';

interface Testimonial {
  _id: string;
  authorName: string;
  authorCompany: string;
  quote: string;
  imageUrl?: string;
  isActive: boolean;
}

const TestimonialsPage = () => {
    const { token } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const { data } = await API.get('/api/v1/admin/website/testimonials', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTestimonials(data);
        } catch (err) {
            setError('Failed to fetch testimonials.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTestimonials();
        }
    }, [token]);

    const handleSaveTestimonial = async (testimonialData: Omit<Testimonial, '_id'>) => {
        const url = editingTestimonial
            ? `/api/v1/admin/website/testimonials/${editingTestimonial._id}`
            : '/api/v1/admin/website/testimonials';
        const method = editingTestimonial ? 'put' : 'post';

        try {
            await API[method](url, testimonialData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTestimonials();
            setIsModalOpen(false);
            setEditingTestimonial(null);
        } catch (err) {
            setError('Failed to save testimonial.');
        }
    };

    const handleDeleteTestimonial = async () => {
        if (!testimonialToDelete) return;

        try {
            await API.delete(`/api/v1/admin/website/testimonials/${testimonialToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchTestimonials();
            setIsConfirmModalOpen(false);
            setTestimonialToDelete(null);
        } catch (err) {
            setError('Failed to delete testimonial.');
        }
    };

    return (
        <>
            <TestimonialModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveTestimonial}
                testimonial={editingTestimonial}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleDeleteTestimonial}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the testimonial from "${testimonialToDelete?.authorName}"?`}
                variant="danger"
            />
            <div className="page-container">
                <div className="page-header">
                    <h1>Manage Testimonials</h1>
                    <button className="add-project-button" onClick={() => { setEditingTestimonial(null); setIsModalOpen(true); }}>
                        + Add Testimonial
                    </button>
                </div>
                {loading && <p>Loading testimonials...</p>}
                {error && <p className="error-message">{error}</p>}
                <div className="table-container">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Author</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {testimonials.map(testimonial => (
                                <tr key={testimonial._id}>
                                    <td>{testimonial.authorName}</td>
                                    <td>{testimonial.authorCompany}</td>
                                    <td>
                                        <span className={`status-badge ${testimonial.isActive ? 'status-completed' : 'status-on-hold'}`}>
                                            {testimonial.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-button" onClick={() => { setEditingTestimonial(testimonial); setIsModalOpen(true); }}>Edit</button>
                                        <button className="action-button" onClick={() => { setTestimonialToDelete(testimonial); setIsConfirmModalOpen(true); }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default TestimonialsPage;