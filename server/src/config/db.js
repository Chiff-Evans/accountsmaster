const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'accountsmaster',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

// `timezone: '+00:00'` above only controls how the driver PARSES values it
// gets back — it doesn't make the MySQL server itself compute NOW()/
// CURRENT_TIMESTAMP in UTC. If the server's own `time_zone` is 'SYSTEM' (the
// common default) and the OS is set to a non-UTC zone, timestamp defaults
// get written in local time while the driver labels them UTC, silently
// shifting every displayed date/time by the server's UTC offset. Forcing
// every pooled connection's session to UTC makes the two agree regardless
// of which machine/timezone MySQL happens to be running on.
pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'");
});

module.exports = pool;
