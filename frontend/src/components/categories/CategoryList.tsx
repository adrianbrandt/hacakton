import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface Category {
    id: number;
    name: string;
    sifo_code?: string;
    description?: string;
    parent_id: number | null;
    subcategories?: Category[];
}

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.getCategories();

                // Group categories by parent
                const groupedCategories = data.reduce((acc: Category[], category: Category) => {
                    if (!category.parent_id) {
                        // This is a parent category
                        category.subcategories = data.filter((c: Category) => c.parent_id === category.id);
                        acc.push(category);
                    }
                    return acc;
                }, []);

                setCategories(groupedCategories);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch categories');
                setLoading(false);
                console.error(err);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="category-list">
            <div className="card">
                <div className="transaction-header">
                    <h2>Categories</h2>
                    <Link to="/categories/new" className="btn">Add Category</Link>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>SIFO Code</th>
                            <th>Description</th>
                            <th>Subcategories</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categories.map(category => (
                            <React.Fragment key={category.id}>
                                <tr>
                                    <td>{category.name}</td>
                                    <td>{category.sifo_code || '-'}</td>
                                    <td>{category.description || '-'}</td>
                                    <td>{category.subcategories?.length || 0}</td>
                                    <td>
                                        <div className="actions">
                                            <Link
                                                to={`/categories/${category.id}`}
                                                className="btn btn-small"
                                            >
                                                View
                                            </Link>
                                            <Link
                                                to={`/categories/edit/${category.id}`}
                                                className="btn btn-small btn-secondary"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                                {category.subcategories?.map(subcategory => (
                                    <tr key={subcategory.id} className="subcategory">
                                        <td>└ {subcategory.name}</td>
                                        <td>{subcategory.sifo_code || '-'}</td>
                                        <td>{subcategory.description || '-'}</td>
                                        <td>-</td>
                                        <td>
                                            <div className="actions">
                                                <Link
                                                    to={`/categories/${subcategory.id}`}
                                                    className="btn btn-small"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    to={`/categories/edit/${subcategory.id}`}
                                                    className="btn btn-small btn-secondary"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CategoryList;