import { DataSource } from 'typeorm';
import { Patient } from '../entities/Patient';
import { Note } from '../entities/Note';
import { env } from './env';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  entities: [Patient, Note],
  synchronize: true,
  logging: false,
  ssl: {
    rejectUnauthorized: false
  },
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
