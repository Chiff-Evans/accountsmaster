/**
 * Generate SQL migration script from legacy QuickNest products.
 *
 * Usage:
 *   node server/database/migrations/migrate_legacy_products.js
 *   node server/database/migrations/migrate_legacy_products.js > migrate_legacy_products.sql
 *
 * Reads:  server/database/quicknest/legacy products.sql
 * Prints: a ready-to-run SQL script to stdout
 */

const fs   = require('fs');
const path = require('path');

const SQL_FILE    = path.join(__dirname, '../quicknest/legacy products.sql');
const OUT_FILE    = process.argv[2] || null; // optional: node script.js output.sql

// Matches the VALUES(...) portion of each INSERT line.
// Captures: (Name, Code, MeasurementUnit, Price, Cost)
// Handles '' escaped apostrophes inside quoted strings.
const ROW_RE = /VALUES\s*\(\d+,\s*(?:NULL|\d+),\s*'((?:[^']|'')*)',\s*'(?:[^']|'')*',\s*(?:'(?:[^']|'')*'|NULL),\s*([\d.]+),\s*([\d.]+)\)/i;

if (!fs.existsSync(SQL_FILE)) {
  process.stderr.write(`Source file not found: ${SQL_FILE}\n`);
  process.exit(1);
}

const lines   = fs.readFileSync(SQL_FILE, 'utf8').split('\n');
const rows    = [];
let   skipped = 0;

for (const line of lines) {
  const trimmed = line.trim();
  if (!trimmed.toUpperCase().startsWith('INSERT')) continue;

  const match = trimmed.match(ROW_RE);
  if (!match) {
    skipped++;
    process.stderr.write(`[SKIP] Could not parse: ${trimmed.slice(0, 120)}\n`);
    continue;
  }

  const [, rawName, rawPrice, rawCost] = match;

  const itemName    = rawName.trim();
  const priceAmount = parseFloat(rawPrice).toFixed(2);
  const buyingPrice = parseFloat(rawCost).toFixed(2);

  rows.push({ itemName, priceAmount, buyingPrice });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  // Escape backslashes and single-quotes for MySQL string literals
  return str.replace(/\\/g, '\\\\').replace(/'/g, "''");
}

function sqlStr(val) {
  return val === null ? 'NULL' : `'${esc(val)}'`;
}

// ── build output ─────────────────────────────────────────────────────────────

const out = [];

out.push('-- ============================================================');
out.push('-- Legacy QuickNest → SalesMaster migration');
out.push(`-- Generated: ${new Date().toISOString()}`);
out.push(`-- Products  : ${rows.length}`);
out.push('-- ============================================================');
out.push('');
out.push('SET FOREIGN_KEY_CHECKS = 0;');
out.push('');
out.push('-- Staging table');
out.push('DROP TEMPORARY TABLE IF EXISTS _leg;');
out.push('CREATE TEMPORARY TABLE _leg (');
out.push('  id        INT PRIMARY KEY AUTO_INCREMENT,');
out.push('  item_name VARCHAR(300) NOT NULL COLLATE utf8mb4_unicode_ci,');
out.push('  price     DECIMAL(12,2) NOT NULL DEFAULT 0,');
out.push('  cost      DECIMAL(12,2) NOT NULL DEFAULT 0,');
out.push('  item_id   INT');
out.push(');');
out.push('');
out.push('-- Insert legacy rows');
out.push('INSERT INTO _leg (item_name, price, cost) VALUES');

const valueLines = rows.map(({ itemName, priceAmount, buyingPrice }) =>
  `  (${sqlStr(itemName)}, ${priceAmount}, ${buyingPrice})`
);
out.push(valueLines.join(',\n') + ';');

out.push('');
out.push('-- Upsert into items');
out.push('INSERT INTO items (item_name, category_id, is_active)');
out.push('SELECT TRIM(item_name), NULL, 1');
out.push('FROM _leg');
out.push('ON DUPLICATE KEY UPDATE');
out.push('  item_name = VALUES(item_name);');
out.push('');
out.push('-- Resolve item_id back into staging table');
out.push('UPDATE _leg l');
out.push('INNER JOIN items i ON i.item_name = TRIM(l.item_name) AND i.item_code IS NULL');
out.push('SET l.item_id = i.id;');
out.push('');
out.push('-- Insert prices');
out.push('INSERT INTO prices');
out.push('  (item_id, unit_id, price_amount, buying_price, effective_from, effective_to, quantity, is_active, currency)');
out.push('SELECT item_id, NULL, price, cost, \'2026-06-01\', NULL, 1, 1, \'KES\'');
out.push('FROM _leg');
out.push('WHERE item_id IS NOT NULL;');
out.push('');
out.push('DROP TEMPORARY TABLE IF EXISTS _leg;');
out.push('');
out.push('SET FOREIGN_KEY_CHECKS = 1;');
out.push('');

const sql = out.join('\n');

if (OUT_FILE) {
  fs.writeFileSync(OUT_FILE, sql, 'utf8');
  process.stderr.write(`Written to ${OUT_FILE}\n`);
} else {
  process.stdout.write(sql);
}

process.stderr.write(`\nDone. ${rows.length} products, ${skipped} skipped.\n`);
