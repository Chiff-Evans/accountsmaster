/**
 * One-off seed script: replaces the sample Counties (parameter_id 16) and
 * Sub-Counties (parameter_id 17) parameter_values with the real 47 Kenyan
 * counties and their sub-counties from kenya_counties_sub_counties.json,
 * linking each sub-county to its county via the new parent_value_id column.
 *
 * Run once:  node database/migrations/seed_kenya_counties.js
 */
require('dotenv').config();
const path = require('path');
const mysql = require('mysql2/promise');
const data = require('../kenya_counties_sub_counties.json');

const COUNTY_PARAM_ID = 16;
const SUBCOUNTY_PARAM_ID = 17;

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'accountsmaster',
  });

  try {
    console.log('Deleting existing Counties/Sub-Counties parameter values...');
    await pool.query('DELETE FROM parameter_values WHERE parameter_id IN (?, ?)', [COUNTY_PARAM_ID, SUBCOUNTY_PARAM_ID]);

    let countyCount = 0, subCount = 0;
    for (const county of data.counties) {
      const [result] = await pool.query(
        'INSERT INTO parameter_values (parameter_id, paramater_value, is_active) VALUES (?, ?, 1)',
        [COUNTY_PARAM_ID, county.name]
      );
      countyCount++;
      const countyId = result.insertId;

      if (county.sub_counties.length) {
        const values = county.sub_counties.map(name => [SUBCOUNTY_PARAM_ID, countyId, name, 1]);
        await pool.query(
          'INSERT INTO parameter_values (parameter_id, parent_value_id, paramater_value, is_active) VALUES ?',
          [values]
        );
        subCount += county.sub_counties.length;
      }
    }

    console.log(`Seeded ${countyCount} counties and ${subCount} sub-counties.`);
  } finally {
    await pool.end();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
