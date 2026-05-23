import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialize Google GenAI SDK to avoid crashing on start if the key is missing.
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please add it to Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for health literacy AI translator and explainer
app.post("/api/gemini/translate", async (req: any, res: any) => {
  try {
    const { text, type } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text' payload." });
    }

    const client = getAiClient();
    let prompt = "";
    let systemInstruction = 
      "You are a professional, encouraging, and highly accessible health literacy educator and translator. " +
      "Your core goal is to explain complex medical jargon, prescription information, or health insurance terms " +
      "in extremely clear, plain, and friendly language that a general public audience (with low health literacy) " +
      "can easily understand. Refrain from using complex medical terms without immediately providing a simple definition. " +
      "Focus on empowerement and identifying specific, actionable questions for users to ask their healthcare team. " +
      "ALWAYS include an educational disclaimer that this tool is for general health literacy and educational purposes " +
      "only and does not constitute official medical advice.";

    if (type === "jargon") {
      prompt = `Analyze and simplify this medical jargon, clinician note, or diagnosis term so that a layperson can easily understand it. 
Explain any complex terminology using simple, everyday words. 
Format your response with the following sections:
1. **Simplified Translation** (A 1-2 sentence high-level translation of what this means)
2. **Key Terms Explained** (Bullet points of each medical word translated to simple words)
3. **Actionable Next Steps** (Simple actions the patient might take)
4. **Questions for Your Doctor** (A few highly relevant questions regarding this note)

Medical Text: "${text}"`;
    } else if (type === "prescription") {
      prompt = `Analyze this prescription label text or medication instructions. 
Extract the core details and present them in a friendly, easy-to-read checklist:
1. **Medication Name & Purpose**
2. **Dosage & Frequency Instructions** (Make this incredibly literal, e.g. "Take 1 pill each morning with a full glass of water")
3. **Critical Warnings & Dietary Rules** (e.g., take with food, avoid alcohol, sun exposure sensitivity)
4. **Refills & Quantity Info**
5. **How to Ask Your Pharmacist** (A few essential questions for safety)

Prescription Text:\n${text}`;
    } else {
      prompt = `Explicate this general health literacy or healthcare navigation question in plain, simple language:
- Explode and explain any complex processes (like deductibles, prior authorization, or specialist referrals)
- Provide simple real-world analogies
- Offer clear, empowering guidance

Question: "${text}"`;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature is better for concise, accurate educational explanations
      },
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error?.message || "An error occurred with the AI health literacy engine." });
  }
});

// Configure Vite middleware or serve static static files
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting and listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
