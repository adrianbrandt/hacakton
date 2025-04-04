import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

interface Category {
    id?: number;
    name: string;
    sifo_code?: string;
    description?: string;
    parent_id?: number | null;
}

interface ParentCategory {
    id: number;
    name: string;
}

const CategoryForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);
    const [formData, setFormData] = useState<Category>({
        name: '',
        sifo_code: '',
        description: '',
        parent_id: undefined
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const isEditing = Boolean(id);

    useEffect(() => {
        // Fetch parent categories and existing category details if editing
        const fetchData = async () => {
            try {
                // Fetch parent categories (top-level categories)
                const categories = await api.getCategories();
                const parents = categories.filter((cat: Category) => !cat.parent_id);
                setParentCategories(parents);

                // If editing, fetch category details
                if (isEditing) {
                    const categoryData = await api.getCategory(parseInt(id!));
                    setFormData({
                        id: categoryData.id,
                        name: categoryData.name,
                        sifo_code: categoryData.sifo_code || '',
                        description: categoryData.description || '',
                        parent_id: categoryData.parent_id || undefined
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load category data');
            }
        };

        fetchData();
    }, [id, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? undefined : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Remove undefined values and id for submission
            const { id: _, ...submissionData } = formData;

            if (isEditing) {
                await api.updateCategory(parseInt(id!), submissionData);
            } else {
                await api.createCategory(submissionData);
            }

            navigate('/categories');
        } catch (err) {
            console.error(err);
            setError('Failed to save category');
            setIsLoading(false);
        }
    };

    return (
        <div className="category-form card">
            <h2>{isEditing ? 'Edit Category' : 'Add New Category'}</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">SIFO Code (Optional)</label>
                    <input
                        type="text"
                        name="sifo_code"
                        value={formData.sifo_code || ''}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Parent Category (Optional)</label>
                    <select
                        name="parent_id"
                        value={formData.parent_id || ''}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">-- Select Parent Category --</option>
                        {parentCategories.map(parent => (
                            <option key={parent.id} value={parent.id}>
                                {parent.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Saving...'
                            : (isEditing ? 'Update Category' : 'Add Category')
                        }
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate('/categories')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;