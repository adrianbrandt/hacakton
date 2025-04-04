import express from 'express';
import db from '../db';

const router = express.Router();

// Get all transactions
router.get('/', async (req, res) => {
    try {
        const {
            limit,
            sort,
            startDate,
            endDate,
            transactionType
        } = req.query;

        // Base query
        let query = `
            SELECT t.*, c.name as category_name 
            FROM transactions t 
            LEFT JOIN categories c ON t.category_id = c.id
        `;

        const whereClauses: string[] = [];
        const queryParams: any[] = [];

        // Handle date filtering
        if (startDate && endDate) {
            whereClauses.push(`t.booking_date BETWEEN $${queryParams.length + 1} AND $${queryParams.length + 2}`);
            queryParams.push(startDate, endDate);
        } else if (startDate) {
            whereClauses.push(`t.booking_date >= $${queryParams.length + 1}`);
            queryParams.push(startDate);
        } else if (endDate) {
            whereClauses.push(`t.booking_date <= $${queryParams.length + 1}`);
            queryParams.push(endDate);
        }

        // Handle transaction type filtering
        if (transactionType) {
            switch (transactionType) {
                case 'income':
                    whereClauses.push(`t.amount > 0`);
                    break;
                case 'expense':
                    whereClauses.push(`t.amount < 0`);
                    break;
                // 'all' doesn't require additional filtering
            }
        }

        // Add WHERE clause if we have any conditions
        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Add sorting
        query += ` ORDER BY t.booking_date ${sort === 'asc' ? 'ASC' : 'DESC'}`;

        // Add limit
        if (limit) {
            query += ` LIMIT $${queryParams.length + 1}`;
            queryParams.push(Number(limit));
        }

        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error', details: error });
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
        res.status(500).json({ error: 'Internal server error', details: error });
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
        res.status(500).json({ error: 'Internal server error', details: error });
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
        res.status(500).json({ error: 'Internal server error', details: error });
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
        res.status(500).json({ error: 'Internal server error', details: error });
    }
});

export default router;