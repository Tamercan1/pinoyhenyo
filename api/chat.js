import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const mainModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.1-flash-lite';

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { contents, systemInstruction } = req.body;

        const modelsToTry = [mainModel, fallbackModel];

        for (const model of modelsToTry) {
            try {
                const response = await ai.models.generateContent({
                    model: model,
                    contents: contents,
                    config: {
                        systemInstruction: systemInstruction,
                        temperature: 0.2
                    }
                });

                return res.status(200).json({
                    reply: response.text
                });
            }
            catch (error) {
                if (model === modelsToTry[modelsToTry.length - 1]) {
                    throw error;
                }
            }
        }
    }
    catch (error) {
        console.error("Serverless Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI" });
    }
}