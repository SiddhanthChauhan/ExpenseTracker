import express from 'express';
import type { Request, Response } from 'express'; // Explicit type import
import cors from 'cors';
import { z } from 'zod';
import { createExpenseSchema } from './schema.js';
import db from './db/index.js'; // Note the .js extension, required for ESM

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());



// 2. The POST Route
app.post('/expenses', (req: Request, res: Response): any => {
  try {
    // Step A: Validate incoming data
    const parsedData = createExpenseSchema.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        error: "Invalid payload",
        details: parsedData.error.issues
      });
    }

    const { amount, category, description, date, idempotency_key } = parsedData.data;

    // Step B: Attempt to insert the new expense
    try {
      const insertStmt = db.prepare(`
        INSERT INTO expenses (amount, category, description, date, idempotency_key)
        VALUES (?, ?, ?, ?, ?)
      `);

      const result = insertStmt.run(amount, category, description || null, date, idempotency_key);

      // Fetch and return the newly created row
      const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);

      return res.status(201).json(newExpense);

    } catch (dbError: any) {
      // Step C: The Idempotency Catch (CRITICAL)
      // If the error is a unique constraint failure on idempotency_key, it's a retry.
      if (dbError.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log(`[Idempotency] Duplicate request caught for key: ${idempotency_key}. Returning existing record.`);

        const existingExpense = db.prepare('SELECT * FROM expenses WHERE idempotency_key = ?').get(idempotency_key);

        // Return 200 OK (not 201 Created) since it already existed
        return res.status(200).json(existingExpense);
      }

      // If it's a different database error, throw it to the generic catch block
      throw dbError;
    }

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// 3. The GET Route
app.get('/expenses', (req: Request, res: Response): any => {
  try {
    const { category, sort } = req.query;

    let query = 'SELECT * FROM expenses';
    const queryParams: any[] = [];

    // 1. WHERE clause comes first
    if (category && typeof category === 'string') {
      query += ' WHERE category = ?';
      queryParams.push(category); // Push category variable first
    }

    // 2. ORDER BY comes next
    if (sort === 'date_desc') {
      query += ' ORDER BY date DESC, created_at DESC';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    // 3. LIMIT and OFFSET must come absolute last
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset); // Push limit and offset last

    const stmt = db.prepare(query);
    const expenses = stmt.all(...queryParams);

    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});