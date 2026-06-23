import { getDatabase } from './database';
import { SEED_PARTICIPANTS, SEED_RECEIPTS, getAvatarColor } from '@/constants/seedData';

export async function seedIfEmpty(): Promise<void> {
  const db = getDatabase();

  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM receipts'
  );

  if (result && result.count > 0) return;

  const now = Date.now();

  for (const p of SEED_PARTICIPANTS) {
    await db.runAsync(
      'INSERT INTO participants (name, avatar_color) VALUES (?, ?)',
      [p.name, p.avatarColor]
    );
  }

  for (const r of SEED_RECEIPTS) {
    const timestamp = now - r.daysAgo * 24 * 60 * 60 * 1000;
    const res = await db.runAsync(
      'INSERT INTO receipts (title, date, total_amount, payer, is_settled, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [r.title, r.date, r.totalAmount, r.payer, r.isSettled ? 1 : 0, timestamp]
    );
    const receiptId = res.lastInsertRowId;

    for (const item of r.items) {
      await db.runAsync(
        'INSERT INTO receipt_items (receipt_id, name, price, assigned_to) VALUES (?, ?, ?, ?)',
        [receiptId, item.name, item.price, item.assignedTo]
      );
    }
  }
}
