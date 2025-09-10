
// FIX: Import Request and Response types from express to fix typing issues with request handlers and middleware.
import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from "@google/genai";

// Ensure API_KEY is set
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

const app = express();
const PORT = process.env.PORT || 3001;

// Interfaces (could be moved to a shared types file in a larger project)
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
// Increase payload size limit for base64 images
app.use(express.json({ limit: '10mb' }));

// API routes
// FIX: Use correct types for request and response objects.
app.get('/api/orders', (req: Request, res: Response) => {
    // In a real app, you'd fetch this from a database.
    // For now, returning an empty array to match initial frontend state.
    res.json([]);
});

// FIX: Use correct types for request and response objects.
app.post('/api/extract-data', async (req: Request, res: Response) => {
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
// This part is crucial for Render deployment
if (process.env.NODE_ENV === 'production') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // The compiled server code is in server/dist, so we go up two levels to the project root, then into the frontend 'dist' folder.
    const frontendDistPath = path.join(__dirname, '..', '..', 'dist');

    // Serve static files from the React app build directory
    app.use(express.static(frontendDistPath));

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    // FIX: Use correct types for request and response objects.
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
