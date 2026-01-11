import { GoogleGenAI } from "@google/genai";

// Define interface for aistudio to use with type assertion
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

const getAiStudio = (): AIStudio | undefined => {
  return (window as any).aistudio;
};

// Initialize the API client. 
// Note: We create a function to get the instance because we might need to 
// re-instantiate after key selection for Veo.
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const editImageWithGemini = async (base64Image: string, prompt: string, mimeType: string = 'image/png') => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};

export const generateVideoWithVeo = async (base64Image: string, mimeType: string, prompt: string = '') => {
  // Ensure Key is selected for Veo
  const aiStudio = getAiStudio();
  if (aiStudio) {
    const hasKey = await aiStudio.hasSelectedApiKey();
    if (!hasKey) {
      throw new Error("API_KEY_MISSING");
    }
  }

  // Always create a new instance right before the call to ensure latest key
  const ai = getAiClient();

  try {
    let operation = await (ai as any).models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "电影感地动态化这张图片",
      image: {
        imageBytes: base64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9' // Requested in prompt
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await (ai as any).operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");

    // Fetch the actual video bytes using the key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

export const checkApiKey = async () => {
  const aiStudio = getAiStudio();
  if (aiStudio) {
    return await aiStudio.hasSelectedApiKey();
  }
  return true; // Fallback if not in that specific environment, assume env var is there
};

export const openKeySelection = async () => {
  const aiStudio = getAiStudio();
  if (aiStudio) {
    await aiStudio.openSelectKey();
  }
};