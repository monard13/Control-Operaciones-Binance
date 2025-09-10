// FIX: Use `import express from 'express'` and `express.Request`/`express.Response` to fix type resolution issues.
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";
import pg from 'pg';

const { Pool } = pg;

// --- Database Setup ---
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable not set");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Required for Render's managed database connections
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        "totalAmount" NUMERIC NOT NULL,
        status VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL,
        links JSONB NOT NULL,
        "extractedData" JSONB,
        "executionTotals" JSONB,
        "isExecutionRegistered" BOOLEAN DEFAULT FALSE
      );
    `);
    console.log("Database initialized successfully. 'orders' table is ready.");
  } catch (err) {
    console.error("Error initializing database:", err);
    throw err;
  } finally {
    client.release();
  }
}

initializeDatabase().catch(err => {
    console.error("Failed to initialize database on startup:", err);
    process.exit(1);
});

// --- Gemini API Setup ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const app = express();
const PORT = process.env.PORT || 3001;

// Interfaces
interface ExtractedInfo {
  orderNumber: string;
  type: string;
  filledQuantity: string;
  icebergValue: string;
  averagePrice: string;
  conditions: string;
  fee: string;
  total:string;
  creationDate: string;
  updateDate: string;
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- API Routes ---

// GET all orders
// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.get('/api/orders', async (req: express.Request, res: express.Response) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY "createdAt" DESC');
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: 'Failed to fetch orders from database.' });
    }
});

// POST a new order
// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.post('/api/orders', async (req: express.Request, res: express.Response) => {
    const { id, totalAmount, status, createdAt, links } = req.body;
    if (!id || totalAmount === undefined || !status || !createdAt || !links) {
        return res.status(400).json({ error: 'Missing required fields for order.' });
    }
    try {
        const query = `
            INSERT INTO orders(id, "totalAmount", status, "createdAt", links)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [id, totalAmount, status, createdAt, JSON.stringify(links)];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: 'Failed to save order to database.' });
    }
});

// PUT (update) an existing order
// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.put('/api/orders/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    const { totalAmount, status, links, extractedData, executionTotals, isExecutionRegistered } = req.body;
    if (totalAmount === undefined || !status || !links) {
        return res.status(400).json({ error: 'Missing required fields for order update.' });
    }
    try {
        const query = `
            UPDATE orders
            SET "totalAmount" = $1, status = $2, links = $3, "extractedData" = $4, "executionTotals" = $5, "isExecutionRegistered" = $6
            WHERE id = $7
            RETURNING *;
        `;
        const values = [
            totalAmount,
            status,
            JSON.stringify(links),
            extractedData ? JSON.stringify(extractedData) : null,
            executionTotals ? JSON.stringify(executionTotals) : null,
            isExecutionRegistered || false,
            id
        ];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(`Error updating order ${id}:`, error);
        res.status(500).json({ error: 'Failed to update order in database.' });
    }
});

// DELETE an order
// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.delete('/api/orders/:id', async (req: express.Request, res: express.Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM orders WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Order not found.' });
        }
        res.status(204).send(); // Success, no content to return
    } catch (error) {
        console.error(`Error deleting order ${id}:`, error);
        res.status(500).json({ error: 'Failed to delete order from database.' });
    }
});

// POST for bulk deletion
// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.post('/api/orders/bulk-delete', async (req: express.Request, res: express.Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'An array of order IDs is required.' });
    }
    try {
        // Using ANY for efficient deletion of multiple rows
        const query = 'DELETE FROM orders WHERE id = ANY($1::text[])';
        const result = await pool.query(query, [ids]);
        res.status(200).json({ message: `${result.rowCount} orders deleted successfully.` });
    } catch (error) {
        console.error('Error during bulk delete:', error);
        res.status(500).json({ error: 'Failed to delete orders from database.' });
    }
});

// FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
app.post('/api/extract-data', async (req: express.Request, res: express.Response) => {
    const { base64Image, mimeType, prompt } = req.body;

    if (!base64Image || !mimeType || !prompt) {
        return res.status(400).json({ error: 'Missing required fields: base64Image, mimeType, prompt' });
    }

    try {
        const responseSchema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    orderNumber: { type: Type.STRING, description: "Order Number" },
                    type: { type: Type.STRING, description: "Type (e.g., Limit / Buy)" },
                    filledQuantity: { type: Type.STRING, description: "Filled / Quantity" },
                    icebergValue: { type: Type.STRING, description: "Iceberg Value" },
                    averagePrice: { type: Type.STRING, description: "Average / Price" },
                    conditions: { type: Type.STRING, description: "Conditions" },
                    fee: { type: Type.STRING, description: "Fee" },
                    total: { type: Type.STRING, description: "Total" },
                    creationDate: { type: Type.STRING, description: "Creation Date" },
                    updateDate: { type: Type.STRING, description: "Update Date" },
                },
                required: ["orderNumber", "type", "filledQuantity", "total", "creationDate", "fee", "averagePrice", "icebergValue", "conditions", "updateDate"]
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const text = response.text;
        if (!text) {
            console.error("Gemini API returned no text content.");
            return res.status(500).json({ error: "Failed to get a valid response from AI service." });
        }

        const jsonText = text.trim();
        const extractedData = JSON.parse(jsonText) as ExtractedInfo[];
        res.json(extractedData);

    } catch (error) {
        console.error("Error calling Gemini API or parsing response:", error);
        if (error instanceof SyntaxError) {
             res.status(500).json({ error: 'Failed to parse JSON from AI response.' });
        } else {
             res.status(500).json({ error: 'Failed to extract data from image.' });
        }
    }
});


// Serve frontend
if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendDistPath = path.join(__dirname, '..', '..', 'dist');
    app.use(express.static(frontendDistPath));
    // FIX: Use `express.Request` and `express.Response` to avoid type conflicts.
    app.get('*', (req: express.Request, res: express.Response) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
