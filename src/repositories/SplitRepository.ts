import { getDatabase } from '@/db/database';

export type Receipt = {
  id: number;
  title: string;
  date: string;
  totalAmount: number;
  payer: string;
  isSettled: boolean;
  timestamp: number;
};

export type ReceiptItem = {
  id: number;
  receiptId: number;
  name: string;
  price: number;
  assignedTo: string; // comma-separated
};

export type Participant = {
  id: number;
  name: string;
  avatarColor: string;
};

type RawReceipt = {
  id: number;
  title: string;
  date: string;
  total_amount: number;
  payer: string;
  is_settled: number;
  timestamp: number;
};

type RawItem = {
  id: number;
  receipt_id: number;
  name: string;
  price: number;
  assigned_to: string;
};

type RawParticipant = {
  id: number;
  name: string;
  avatar_color: string;
};

function mapReceipt(r: RawReceipt): Receipt {
  return {
    id: r.id,
    title: r.title,
    date: r.date,
    totalAmount: r.total_amount,
    payer: r.payer,
    isSettled: r.is_settled === 1,
    timestamp: r.timestamp,
  };
}

function mapItem(i: RawItem): ReceiptItem {
  return {
    id: i.id,
    receiptId: i.receipt_id,
    name: i.name,
    price: i.price,
    assignedTo: i.assigned_to,
  };
}

function mapParticipant(p: RawParticipant): Participant {
  return { id: p.id, name: p.name, avatarColor: p.avatar_color };
}

export const SplitRepository = {
  async getAllReceipts(): Promise<Receipt[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<RawReceipt>(
      'SELECT * FROM receipts ORDER BY timestamp DESC'
    );
    return rows.map(mapReceipt);
  },

  async getReceiptById(id: number): Promise<Receipt | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<RawReceipt>(
      'SELECT * FROM receipts WHERE id = ?',
      [id]
    );
    return row ? mapReceipt(row) : null;
  },

  async getItemsForReceipt(receiptId: number): Promise<ReceiptItem[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<RawItem>(
      'SELECT * FROM receipt_items WHERE receipt_id = ?',
      [receiptId]
    );
    return rows.map(mapItem);
  },

  async getAllParticipants(): Promise<Participant[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<RawParticipant>(
      'SELECT * FROM participants ORDER BY id ASC'
    );
    return rows.map(mapParticipant);
  },

  async insertReceipt(
    title: string,
    date: string,
    totalAmount: number,
    payer: string,
    isSettled: boolean
  ): Promise<number> {
    const db = getDatabase();
    const res = await db.runAsync(
      'INSERT INTO receipts (title, date, total_amount, payer, is_settled, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [title, date, totalAmount, payer, isSettled ? 1 : 0, Date.now()]
    );
    return res.lastInsertRowId;
  },

  async insertItems(
    items: { receiptId: number; name: string; price: number; assignedTo: string }[]
  ): Promise<void> {
    const db = getDatabase();
    for (const item of items) {
      await db.runAsync(
        'INSERT INTO receipt_items (receipt_id, name, price, assigned_to) VALUES (?, ?, ?, ?)',
        [item.receiptId, item.name, item.price, item.assignedTo]
      );
    }
  },

  async insertParticipant(name: string, avatarColor: string): Promise<number> {
    const db = getDatabase();
    const res = await db.runAsync(
      'INSERT INTO participants (name, avatar_color) VALUES (?, ?)',
      [name, avatarColor]
    );
    return res.lastInsertRowId;
  },

  async settleReceipt(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
      'UPDATE receipts SET is_settled = 1 WHERE id = ?',
      [id]
    );
  },

  async settleAllReceipts(): Promise<void> {
    const db = getDatabase();
    await db.runAsync('UPDATE receipts SET is_settled = 1 WHERE is_settled = 0');
  },

  async deleteReceipt(id: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync('DELETE FROM receipts WHERE id = ?', [id]);
    await db.runAsync('DELETE FROM receipt_items WHERE receipt_id = ?', [id]);
  },
};
