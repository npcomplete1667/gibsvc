import Pkg from 'pg';
const { Pool } = Pkg

const pool = new Pool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || ''),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

export default pool