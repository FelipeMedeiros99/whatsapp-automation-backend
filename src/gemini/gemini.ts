import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import { geminiConfirmReservation, geminiDefault, geminiWellcome } from "./geminidata.js";

// console.log(process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});



export default async function geminiResponse(userMessage?: string, model: "welcome" | "default" | "confirmReservation" = "default") {
  const message = model === "welcome" ? geminiWellcome : model === "default" ? geminiDefault : geminiConfirmReservation;
  try{

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${message} /n ${userMessage}`,
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