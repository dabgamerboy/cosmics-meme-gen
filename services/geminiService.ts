import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GeneratedMemeData {
  imageUrl: string;
  title: string;
}

export const generateMemeImage = async (
  topic: string, 
  referenceImage?: string | null,
  isDarkHumor: boolean = false
): Promise<GeneratedMemeData> => {
  try {
    // Step 1: Generate a Title and an Enhanced Prompt using the Text Model
    let systemInstruction = "You are a creative meme expert. Your job is to create a funny, catchy title for a meme and a detailed visual description for an image generator.";
    if (isDarkHumor) systemInstruction += " The style should be dark humor, edgy, and cynical.";
    
    // Explicit instruction for zero-shot visual generation
    systemInstruction += " If no image context is provided, you must invent a specific, funny visual scene that represents the meme topic.";

    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a meme title and a visual image description for the topic: "${topic}".`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, hilarious title for the meme." },
            imagePrompt: { type: Type.STRING, description: "A detailed visual description to generate the meme image. Include details about the subject, expression, and any text captions that should appear inside the image." }
          },
          required: ["title", "imagePrompt"]
        }
      }
    });

    const textData = JSON.parse(textResponse.text || '{}');
    const memeTitle = textData.title || `Meme about ${topic}`;
    let imagePrompt = textData.imagePrompt || `A funny meme about ${topic}`;

    // Step 2: Generate the Image using the Image Model
    const parts: any[] = [];
    
    // Add reference image if exists
    if (referenceImage) {
      // Extract base64 and mime type from Data URL
      const matches = referenceImage.match(/^data:(.+);base64,(.+)$/);
      if (matches && matches.length === 3) {
         parts.push({
           inlineData: {
             mimeType: matches[1],
             data: matches[2]
           }
         });
         imagePrompt += " Use the attached image as the primary visual reference. Alter it or caption it to fit the context. Ensure the image has a high-quality meme aesthetic with legible text captions if applicable.";
      }
    } else {
      // Logic for Text-Only Prompt
      imagePrompt += " Create a humorous, high-quality image from scratch based on this description. Render the meme caption text clearly on the image in a classic meme font style. The image should be a complete, standalone meme.";
    }

    parts.push({ text: imagePrompt });

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts
      }
    });

    if (!imageResponse.candidates || imageResponse.candidates.length === 0) {
      throw new Error("No image generated.");
    }

    const candidate = imageResponse.candidates[0];
    const responseParts = candidate.content?.parts;

    if (!responseParts) {
      throw new Error("Invalid response format.");
    }

    let base64Image = '';

    // Iterate to find the image part
    for (const part of responseParts) {
      if (part.inlineData && part.inlineData.data) {
        const base64Data = part.inlineData.data;
        const mimeType = part.inlineData.mimeType || 'image/png';
        base64Image = `data:${mimeType};base64,${base64Data}`;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("No image data found in response.");
    }

    return {
      imageUrl: base64Image,
      title: memeTitle
    };

  } catch (error) {
    console.error("Gemini Meme Generation Error:", error);
    throw error;
  }
};