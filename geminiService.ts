
import { GoogleGenAI } from "@google/genai";

// Fix: Always use direct process.env.API_KEY in named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Translates audio data to English text using Gemini.
 * Expects audio to be base64 encoded PCM or similar.
 */
export const translateAudioToEnglish = async (base64Audio: string): Promise<string> => {
  try {
    // Fix: Use recommended content structure and direct text property
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/wav',
              data: base64Audio,
            },
          },
          {
            text: "Translate this medical voice note from its original Indian language (Tamil, Hindi, Telugu, Kannada, or Malayalam) into clear medical English. If no speech is detected, return 'No speech detected'. Return only the translated text."
          }
        ]
      },
    });

    return response.text || "Failed to translate audio.";
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return "Error processing audio: " + (error instanceof Error ? error.message : String(error));
  }
};
