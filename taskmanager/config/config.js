require('dotenv').config();

const isNeon = process.env.DATABASE_URL;

const baseConfig = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false
};

if (isNeon) {
  // Use connection URL for Neon.tech
  module.exports = {
    development: {
      ...baseConfig,
      url: process.env.DATABASE_URL
    },
    test: {
      ...baseConfig,
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
    },
    production: {
      ...baseConfig,
      url: process.env.DATABASE_URL
    }
  };
} else {
  // Fallback to individual parameters
  module.exports = {
    development: {
      ...baseConfig,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_DATABASE || 'taskmanager_dev',
      host: process.env.DB_HOST || '127.0.0.1'
    },
    test: {
      ...baseConfig,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_DATABASE_TEST || 'taskmanager_test',
      host: process.env.DB_HOST || '127.0.0.1'
    },
    production: {
      ...baseConfig,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || null,
      database: process.env.DB_DATABASE_PROD || 'taskmanager_prod',
      host: process.env.DB_HOST || '127.0.0.1'
    }
  };
}