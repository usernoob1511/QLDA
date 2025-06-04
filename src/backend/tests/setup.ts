import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config(); // Load environment variables

// Create test database connection
export const testDb = new Sequelize({
  dialect: 'mssql',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.TEST_DB_NAME || 'QLDA_TEST',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
});

// Global setup
beforeAll(async () => {
  try {
    await testDb.authenticate();
    await testDb.sync({ force: true }); // Recreate all tables
  } catch (error) {
    console.error('Test database connection failed:', error);
    process.exit(1);
  }
});

// Global teardown
afterAll(async () => {
  await testDb.close();
}); 