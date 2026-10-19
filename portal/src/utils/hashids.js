// Bijective integer obfuscation — no external dependencies.
// Mirrors server/src/utils/hashids.js exactly (same constants) so ids hashed
// on one side always decode correctly on the other.
// Changing PRIME or ALPHABET breaks all existing URLs — keep them stable.

const PRIME     = 2654435761n;   // Knuth multiplicative constant
const PRIME_INV = 244002641n;    // Modular inverse of PRIME mod 2^32
const MOD       = 0x100000000n;  // 2^32
const ALPHABET  = 'nK4jRpT8vLqW2mXsY6cBdZeA0hFuNgQoP1iC7kM3wJ5rDlbI9fGtOUESVHyx';
const BASE       = BigInt(ALPHABET.length);
const MIN_LEN    = 6;

function toBase(n) {
  let bn = BigInt(n);
  let result = '';
  do {
    result = ALPHABET[Number(bn % BASE)] + result;
    bn = bn / BASE;
  } while (bn > 0n);
  return result.padStart(MIN_LEN, ALPHABET[0]);
}

function fromBase(s) {
  let n = 0n;
  for (const c of s) {
    const idx = ALPHABET.indexOf(c);
    if (idx === -1) throw new Error('invalid char');
    n = n * BASE + BigInt(idx);
  }
  return Number(n);
}

export const encodeId = id => toBase(Number((BigInt(id) * PRIME) % MOD));

export const decodeId = hash => {
  try {
    const n = fromBase(String(hash).trim());
    return Number((BigInt(n) * PRIME_INV) % MOD);
  } catch { return null; }
};
