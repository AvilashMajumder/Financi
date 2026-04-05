import express from 'express';
import cookieParser from 'cookie-parser';
import userRouter from './routes/User.route.js';
import transactionRouter from './routes/Transaction.route.js';
import dashboardRouter from './routes/Dashboard.route.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Financi API is running!',
        status: 'Server is operational',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/users',
            transactions: '/api/transactions',
            dashboard: '/api/dashboard'
        }
    });
});

app.use('/api/users', userRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/dashboard', dashboardRouter);


export {app};