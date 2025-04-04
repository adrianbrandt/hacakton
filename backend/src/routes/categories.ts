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
            return
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching category:', error);
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