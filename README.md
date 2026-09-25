# 🇵🇭 Pinoy Henyo AI

A classic Filipino guessing game ("Pinoy Henyo") powered by the Google Gemini API. 

Play the game live here: **[https://pinoyhenyo-tam.vercel.app](https://pinoyhenyo-tam.vercel.app)**


## 🎮 Game Modes

* **Ako ang huhula**: The AI thinks of a random Tagalog word, and you ask Yes/No/Pwede questions until you guess it!
* **Ikaw ang huhula**: You think of a secret word, and the AI will try to guess it by asking you strategic questions.

## 🚀 Technologies Used

* **Frontend:** HTML, CSS, Vanilla JavaScript (bundled with Vite)
* **Backend:** Vercel Serverless Functions (`/api/chat.js`)
* **AI:** Google Gemini API (`@google/genai`)

## 🛠️ Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-3.5-flash-lite
   GEMINI_FALLBACK_MODEL=gemini-3.1-flash-lite
   ```
4. Run locally using the Vercel CLI (required to test the backend API locally):
   ```bash
   npx vercel dev
   ```

---
*Coded by: Tamercan Wawa*
