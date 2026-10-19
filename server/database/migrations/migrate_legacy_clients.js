/**
 * Generate SQL migration script from legacy QuickNest customers → Accounts Master shops.
 *
 * Usage:
 *   node server/database/migrations/migrate_legacy_clients.js
 *   node server/database/migrations/migrate_legacy_clients.js migrate_legacy_clients.sql
 *
 * Reads:  server/database/quicknest/legacy_clients.sql
 * Prints: INSERT INTO shops (...) ready-to-run SQL
 *
 * Field mapping:
 *   Name (minus appended phone)  → shop_name
 *   Name (phone suffix if any)   → phone
 *   StreetName                   → geolocation
 *   DateCreated                  → created_at
 *   Email                        → email
 */

const fs   = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, '../quicknest/legacy_clients.sql');
const OUT_FILE = process.argv[2] || null;

// Matches: VALUES (Id, 'Name', 'DateCreated', Email, StreetName)
// Email and StreetName can be NULL or a quoted string.
const ROW_RE = /VALUES\s*\(\d+,\s*'((?:[^']|'')*)',\s*'([^']*)',\s*(NULL|'(?:[^']|'')*'),\s*(NULL|'(?:[^']|'')*')\)/i;

// Phone suffix: "- 07XXXXXXXX" or "- +254XXXXXXXXX" at the end of the name
const PHONE_RE = /^(.*?)\s*-\s*(\+?(?:254|0)\d{9})\s*$/;

if (!fs.existsSync(SQL_FILE)) {
  process.stderr.write(`Source file not found: ${SQL_FILE}\n`);
  process.exit(1);
}

const lines  = fs.readFileSync(SQL_FILE, 'utf8').split('\n');
const rows   = [];
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

  const [, rawName, rawDate, rawEmail, rawStreet] = match;

  // Extract phone suffix from name if present
  const phoneMatch = rawName.match(PHONE_RE);
  const shopName   = (phoneMatch ? phoneMatch[1] : rawName).replace(/''/g, "'").trim();
  const phone      = phoneMatch ? phoneMatch[2].trim() : null;

  // Date: strip sub-second precision so MySQL TIMESTAMP accepts it cleanly
  const createdAt = rawDate.replace(/\.\d+$/, '').trim();

  // Unwrap quoted string or keep null
  function unwrap(val) {
    if (val === 'NULL') return null;
    return val.slice(1, -1).replace(/''/g, "'").trim() || null; // empty string → null
  }

  const email      = unwrap(rawEmail);
  const geolocation = unwrap(rawStreet);

  rows.push({ shopName, phone, email, geolocation, createdAt });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function sqlStr(val) {
  return val === null ? 'NULL' : `'${esc(val)}'`;
}

// ── build output ─────────────────────────────────────────────────────────────

const out = [];

out.push('-- ============================================================');
out.push('-- Legacy QuickNest customers → Accounts Master shops migration');
out.push(`-- Generated: ${new Date().toISOString()}`);
out.push(`-- Shops    : ${rows.length}`);
out.push('-- ============================================================');
out.push('');
out.push('INSERT INTO shops (shop_name, geolocation, phone, email, created_at) VALUES');

const valueLines = rows.map(({ shopName, phone, email, geolocation, createdAt }) =>
  `  (${sqlStr(shopName)}, ${sqlStr(geolocation)}, ${sqlStr(phone)}, ${sqlStr(email)}, '${createdAt}')`
);

out.push(valueLines.join(',\n') + ';');
out.push('');

const sql = out.join('\n');

if (OUT_FILE) {
  fs.writeFileSync(OUT_FILE, sql, 'utf8');
  process.stderr.write(`Written to ${OUT_FILE}\n`);
} else {
  process.stdout.write(sql);
}

process.stderr.write(`Done. ${rows.length} shops, ${skipped} skipped.\n`);
