import express from "express";
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  const { messages } = req.body; // [{role: 'user', text: 'Hi'}]

  const contents = messages.map(msg => ({ parts: [{ text: msg.text }] }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI Error" });
  }
});

export default router;
