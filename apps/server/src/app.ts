import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import resourceRoutes from './routes/resource';
import reservationRoutes from './routes/reservation';
import organizationRoutes from './routes/organization';
import resourceTypeRoutes from './routes/resourceType';
import branchRoutes from './routes/branch';

//...
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes 
app.use('/auth', authRoutes);
app.use('/resources', resourceRoutes);
app.use('/reservations', reservationRoutes);
app.use('/organizations', organizationRoutes);
app.use('/resource-types', resourceTypeRoutes);
app.use('/branches', branchRoutes);

// Error handling
app.use(errorHandler);

export default app;
