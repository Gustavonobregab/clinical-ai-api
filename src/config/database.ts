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
  ssl: env.DB_HOST.includes('rds.amazonaws.com') ? {
    rejectUnauthorized: false
  } : false,
});

export const initializeDatabase = async () => {
  try {
    console.log('DB_HOST:', env.DB_HOST);
    console.log('SSL enabled:', env.DB_HOST.includes('rds.amazonaws.com'));
    await AppDataSource.initialize();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
