import express from 'express';
import db from '../db';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id ORDER BY t.booking_date DESC LIMIT 100'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            'SELECT t.*, c.name as category_name FROM transactions t LEFT JOIN categories c ON t.category_id = c.id WHERE t.id = $1',
            [id]
        );
        if (rows.length === 0) {
            res.status(404).json({ error: 'Transaction not found' });
            return
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new transaction
router.post('/', async (req, res) => {
    try {
        const { booking_date, amount, sender, receiver, name, title, currency, payment_type, category_id } = req.body;

        const { rows } = await db.query(
            'INSERT INTO transactions (booking_date, amount, sender, receiver, name, title, currency, payment_type, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [booking_date, amount, sender, receiver, name, title, currency, payment_type, category_id]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update transaction
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { booking_date, amount, sender, receiver, name, title, currency, payment_type, category_id } = req.body;

        const { rows } = await db.query(
            'UPDATE transactions SET booking_date = $1, amount = $2, sender = $3, receiver = $4, name = $5, title = $6, currency = $7, payment_type = $8, category_id = $9, updated_at = CURRENT_TIMESTAMP WHERE id = $10 RETURNING *',
            [booking_date, amount, sender, receiver, name, title, currency, payment_type, category_id, id]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: 'Transaction not found' });
            return
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { rowCount } = await db.query('DELETE FROM transactions WHERE id = $1', [id]);

        if (rowCount === 0) {
            res.status(404).json({ error: 'Transaction not found' });
            return
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;