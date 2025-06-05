import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

// console.log('DEBUG: process.env =', process.env);
// console.log('NODE_ENV:', process.env.NODE_ENV);

const bootStrap = async () => {
  await initMongoConnection();
  setupServer();
};
bootStrap();
