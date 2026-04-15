import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const bootStrap = async () => {
  await initMongoConnection();
  setupServer();
};
bootStrap();
