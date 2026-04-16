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
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/resource-types', resourceTypeRoutes);
app.use('/api/branches', branchRoutes);

// Error handling
app.use(errorHandler);

export default app;
