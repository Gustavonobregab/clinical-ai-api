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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/patients', patientRoutes);
app.use('/notes', noteRoutes);

app.use(errorHandler);

export default app;
