import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import { geminiConfirmReservation, geminiDefault, geminiWellcome } from "./geminidata.js";

// console.log(process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});



export default async function geminiResponse(userMessage?: string, model: "welcome" | "default" | "confirmReservation" = "default") {
  const message = model === "welcome" ? geminiWellcome : model === "default" ? geminiDefault : geminiConfirmReservation;
  try{
    console.log({userMessage})
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${message} /n 
      #ÚLTIMAS MENSAGENS DA CONVERSA
      * As mensagens do tipo from: me, indicam mensagens enviadas por você
      * as mensagens do tipo from: client, indicam mensagens enviadas pelo cliente
      * A ordem das mensagens está da mais antiga para a mais nova. 
      ${userMessage}
      `,
      config: {
        thinkingConfig: {
        thinkingBudget: 0
      }
    }
  });
  return response.text;
  }catch(e){
    console.log(e)
    return "irei repassar você para um atendente"
  }
}