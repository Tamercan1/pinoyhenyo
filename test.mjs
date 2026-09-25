import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey:'dummy'});
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{role: 'user', parts: [{text: 'Hello'}]}],
      config: { systemInstruction: "Be short", temperature: 0.2 }
    });
    console.log(response.text);
  } catch (e) {
    console.log("Error details:", e.message);
  }
}
test();
