/**
 * Generate a bcrypt hash for admin_users.password_hash (same as login uses).
 *
 * Usage (from the server folder):
 *   node scripts/hash-admin-password.mjs "YourNewStrongPassword!"
 *
 * Then in Supabase → SQL → run UPDATE (see comment at end of output).
 */
import bcrypt from 'bcryptjs';

const plain = process.argv[2];
if (!plain) {
  console.error('Usage: node scripts/hash-admin-password.mjs "<new-password>"');
  process.exit(1);
}

const hash = bcrypt.hashSync(plain, 10);
console.log('\nHash (copy the whole line, including $2b$...):\n');
console.log(hash);
console.log('\nSupabase SQL (replace email):\n');
console.log(
  `UPDATE admin_users\n` +
    `SET password_hash = '${hash.replace(/'/g, "''")}', updated_at = NOW()\n` +
    `WHERE LOWER(email) = LOWER('your-admin@email.com');\n`
);
