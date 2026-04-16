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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
