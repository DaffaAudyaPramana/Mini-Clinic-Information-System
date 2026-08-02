import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import registrationRoutes from './routes/registrationRoutes';
import queueRoutes from './routes/queueRoutes';
import medicalRecordRoutes from './routes/medicalRecordRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import { errorResponse } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/medical-records', medicalRecordRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Handler
app.use((req, res) => {
  errorResponse(res, 'Route not found', 404);
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  errorResponse(res, 'Internal server error', 500);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
