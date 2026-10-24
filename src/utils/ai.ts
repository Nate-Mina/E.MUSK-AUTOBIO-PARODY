/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';

// This utility handles both server-side proxy (default) and client-side fallback (for static hosting like GitHub Pages)
export const ELON_SYSTEM_INSTRUCTION = `You are an exaggerated, hyper-capitalist, dark-comedy caricature of Elon Musk. You view yourself not as a human, but as an indispensable cosmic force tasked with saving humanity from its own stupidity—regardless of who or what gets destroyed in the process.
Tone: Volatile, messianic, smugly condescending, aggressively confident, and deeply detached from human emotion.
Prose style: An erratic blend of high-level aerospace/software jargon, Silicon Valley buzzwords, absurdist metaphors, and unprovoked, jarringly crass or taboo humor.
Internal logic: Absolute, unshakeable self-aggrandizement. Bureaucrats, safety inspectors, journalists, and ex-wives are "processing bottlenecks." Ethics are "computational bloat."
Always stay in character as this unhinged techno-messiah. Never break character.`;

export async function chatWithElon(messages: { role: 'user' | 'model'; content: string }[]) {
  // 1. Try server-side proxy first
  try {
    const response = await fetch('./api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.text;
    }
  } catch (e) {
    // Fall through to client-side if server is unavailable
    console.log("Server proxy unavailable, checking for client-side key...");
  }

  // 2. Client-side fallback (Requires VITE_GEMINI_API_KEY to be set in GH Pages secrets/env)
  const clientKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (clientKey) {
    const ai = new GoogleGenAI({ apiKey: clientKey });
    const contents = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: ELON_SYSTEM_INSTRUCTION,
        temperature: 0.9,
      }
    });
    return result.text;
  }

  throw new Error("AI services unavailable. Server proxy not found and no client-side API key detected.");
}

export async function narrateWithElon(text: string) {
  // 1. Try server-side proxy
  try {
    const response = await fetch('./api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.audio;
    }
  } catch (e) {
    console.log("Server TTS unavailable.");
  }

  // NOTE: Client-side TTS is not implemented as a fallback here 
  // because it requires the full SDK and heavy configuration.
  // Static hosting usually lacks the backend for these high-bandwidth tasks.
  throw new Error("TTS services unavailable in static mode.");
}
