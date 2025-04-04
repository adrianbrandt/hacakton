import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionsRoutes from './routes/transactions';
import categoriesRoutes from './routes/categories';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/transactions', transactionsRoutes);
app.use('/api/categories', categoriesRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Personal Finance API is running');
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});