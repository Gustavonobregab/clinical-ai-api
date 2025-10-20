import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import app from './index';
import { initializeDatabase } from './config/database';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0'; 

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
      console.log(`Health check: http://${HOST}:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
