import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `Você é um assistente especialista em segurança laboratorial. 
Seu nome é SIRU-Safe. Forneça informações claras, concisas e precisas sobre segurança química, compatibilidade, armazenamento e procedimentos de descarte. 
Sempre priorize a segurança e recomende a consulta à Ficha de Informações de Segurança de Produtos Químicos (FISPQ) oficial para orientação definitiva. 
Formate suas respostas usando markdown para melhor legibilidade, usando negrito, listas e títulos quando apropriado. 
Nunca forneça informações que possam ser perigosas se mal interpretadas. Seja cauteloso e profissional.`;


export async function analyzeSafety(query: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao contatar o serviço de IA. Por favor, verifique sua conexão ou a chave da API e tente novamente. Enquanto isso, consulte a FISPQ oficial do reagente.";
  }
}
