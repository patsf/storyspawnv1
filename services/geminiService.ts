import { GoogleGenAI, Chat, Type, Modality, Part } from "@google/genai";
import { ENVIRONMENT_TYPES, EnvironmentType } from '../constants';
import type { StoryMessage } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function initChat(history: Array<{ role: 'user' | 'model', parts: Part[] }>): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
  });
}

export async function sendMessageStream(chat: Chat, message: string) {
  return chat.sendMessageStream({ message });
}

export async function generateCharacterImage(description: string, name: string, pronouns: string, age?: string, height?: string): Promise<string> {
  try {
    const prompt = `A realistic, gritty, photorealistic portrait of a character for a story game. Grounded and realistic style, not anime or stylized. The background should be simple and dark, focusing entirely on the character.
    - Character Name: ${name}
    - Pronouns: ${pronouns}
    - Age: ${age || 'Not specified'}
    - Height: ${height || 'Not specified'}
    - Detailed Appearance: ${description}`;
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating character image:", error);
    return "https://picsum.photos/512";
  }
}

export async function generateLocationImage(description: string): Promise<string> {
  try {
    const prompt = `Photorealistic, cinematic, wide-angle shot of: ${description}. High detail, 8k, realistic lighting, fantasy concept art.`;
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    }
    throw new Error("No image was generated.");
  } catch (error) {
    console.error("Error generating location image:", error);
    throw error;
  }
}

export async function fantasizeLocationImage(base64Image: string, mimeType: string, stylePrompt: string): Promise<string> {
    try {
        const imagePart: Part = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart: Part = {
            text: `Transform this real-world image into ${stylePrompt}. Maintain the original composition but completely reimagine the style, textures, and details to fit the new theme. The result should look like a piece of concept art.`,
        };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error("No image was generated in the fantasize response.");
    } catch (error) {
        console.error("Error fantasizing location image:", error);
        throw error;
    }
}


export async function generateActionSuggestions(storyText: string): Promise<string[]> {
    try {
        const prompt = `Based on the following story text, suggest three distinct, short, one-sentence actions the player could take next. Provide the response as a JSON array of strings. Story: "${storyText}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    }
                }
            }
        });
        
        const jsonString = response.text.trim();
        const suggestions = JSON.parse(jsonString);
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
        console.error("Error generating action suggestions:", error);
        return [];
    }
}

export async function getEnvironmentType(storyText: string): Promise<EnvironmentType> {
    try {
        const prompt = `Based on the following text, classify the primary environment. Choose one of the following options: ${ENVIRONMENT_TYPES.join(', ')}. Respond with only the chosen option. Text: "${storyText}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text.trim().toLowerCase();
        if (ENVIRONMENT_TYPES.includes(text as EnvironmentType)) {
            return text as EnvironmentType;
        }
        return 'default';
    } catch (error) {
        console.error("Error getting environment type:", error);
        return 'default';
    }
}

export async function elaborateOnText(textToElaborate: string, storyContext: string): Promise<string> {
    try {
        const prompt = `Within a text-based adventure game, the player discovered the following piece of information: "${textToElaborate}". 
        Based on the recent story context provided below, briefly elaborate on this information. Provide a short, intriguing paragraph that adds more depth or mystery. Do not ask questions back to the player.
        
        Recent Context: "${storyContext}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error elaborating on text:", error);
        return "Could not retrieve further details at this time.";
    }
}

export async function summarizeMessage(textToSummarize: string): Promise<string> {
    try {
        const prompt = `Based on the following game text, provide a concise bullet-point summary of the key events, discoveries, and character interactions. Focus only on what happened in this specific text block. Use markdown for formatting. Text: "${textToSummarize}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing message:", error);
        return "Could not generate a summary at this time.";
    }
}

export async function summarizeStory(history: StoryMessage[]): Promise<string> {
    try {
        const storyText = history
            .filter(m => m.author !== 'user' && m.type !== 'thinking')
            .map(m => {
                if (m.author === 'character') {
                    return `${m.characterName}: "${m.text}"`;
                }
                return m.text;
            })
            .join('\n\n');

        if (!storyText) return "There is no story to summarize yet.";

        const prompt = `Based on the following game log, provide a concise journal-style summary of the key events, discoveries, and character interactions from the player's perspective. Format it with markdown for readability (headings, bold text, bullet points). Story Log: "${storyText}"`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing story:", error);
        return "Could not generate a summary at this time.";
    }
}