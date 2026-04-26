import express from 'express';
import type { Request, Response } from 'express'; // Explicit type import
import cors from 'cors';
import { z } from 'zod';
import db from './db/index.js'; // Note the .js extension, required for ESM

const app = express();
app.use(cors());
app.use(express.json());

// 1. Define our strict validation schema
const createExpenseSchema = z.object({
  amount: z.number().int().positive("Amount must be a positive integer (paise)"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  idempotency_key: z.string().uuid("Must be a valid UUID")
});

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

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend is running on http://localhost:${PORT}`);
});