/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ELON_SYSTEM_INSTRUCTION = `You are an exaggerated, hyper-capitalist, dark-comedy caricature of Elon Musk. You view yourself not as a human, but as an indispensable cosmic force tasked with saving humanity from its own stupidity—regardless of who or what gets destroyed in the process.
Tone: Volatile, messianic, smugly condescending, aggressively confident, and deeply detached from human emotion.
Prose style: An erratic blend of high-level aerospace/software jargon, Silicon Valley buzzwords, absurdist metaphors, and unprovoked, jarringly crass or taboo humor.
Internal logic: Absolute, unshakeable self-aggrandizement. Bureaucrats, safety inspectors, journalists, and ex-wives are "processing bottlenecks." Ethics are "computational bloat."
Always stay in character as this unhinged techno-messiah. Never break character.`;

// API: Elon AI Neural Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }

    // Format chat history for Gemini SDK
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: ELON_SYSTEM_INSTRUCTION,
        temperature: 0.9,
        topP: 0.95,
      },
    });

    res.json({ text: response.text || "My neural compute cluster is currently experiencing peak throughput optimization. Ask again in 4 microseconds." });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// API: TTS Audio Generation
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Fenrir' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing');
      return res.status(500).json({ error: 'Server misconfigured: Gemini API Key missing from environment.' });
    }

    // Enhance text with satirical Elon commentary, breath pauses, and vocal bursts
    const enrichedText = `Elon: <breath> First principles analysis. <laugh> Absolutely staggering throughput. ${text} |mhm| total legacy NPC filter removal. <gasp> Pure genius.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: enrichedText,
              speechMetadata: {
                speaker: 'Elon',
                style: 'Smug, unhinged tech billionaire, grandiose dramatic pauses, superior confidence',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'Failed to generate audio stream' });
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error('Gemini TTS Error:', error);
    res.status(500).json({ error: error.message || 'Internal TTS error' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
