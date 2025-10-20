import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import patientRoutes from './modules/patients/patient.routes';
import noteRoutes from './modules/notes/note.routes';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

dotenv.config();

const app = express();

app.use(helmet());

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://clinical-ai-roan.vercel.app']
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  try {
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use('/patients', patientRoutes);
app.use('/notes', noteRoutes);

app.use(errorHandler);

export default app;
