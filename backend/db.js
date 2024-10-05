const Pool = require('pg').Pool;
require('dotenv').config();

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'api',
//   password: 'postgres',
//   port: 5432,
// })

// const pool = new Pool({
//     user: 'postgres.ahabfpgionnvjyqykiaf',
//     host: 'aws-0-us-east-1.pooler.supabase.com',
//     database: 'postgres',
//     password: 'Yavgesh@123',
//     port: 6543,
//   })


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;