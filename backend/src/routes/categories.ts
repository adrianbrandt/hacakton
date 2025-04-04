import express from 'express';
import db from '../db';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM categories ORDER BY parent_id NULLS FIRST, id');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);

        if (rows.length === 0) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new category
router.post('/', async (req, res) => {
    try {
        const { name, sifo_code, description, parent_id } = req.body;

        const { rows } = await db.query(
            `INSERT INTO categories (name, sifo_code, description, parent_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, sifo_code || null, description || null, parent_id || null]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sifo_code, description, parent_id } = req.body;

        const { rows } = await db.query(
            `UPDATE categories 
             SET name = $1, 
                 sifo_code = $2, 
                 description = $3, 
                 parent_id = $4,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5 
             RETURNING *`,
            [name, sifo_code || null, description || null, parent_id || null, id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM categories WHERE id = $1', [id]);

        if (rowCount === 0) {
            res.status(404).json({ error: 'Category not found' });
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get subcategories for a parent category
router.get('/:id/subcategories', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query('SELECT * FROM categories WHERE parent_id = $1', [id]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get transactions for a category
router.get('/:id/transactions', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            'SELECT * FROM transactions WHERE category_id = $1 ORDER BY booking_date DESC LIMIT 100',
            [id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching category transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;