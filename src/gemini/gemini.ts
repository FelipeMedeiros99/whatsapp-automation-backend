import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import { geminiDefault, geminiWellcome } from "./geminidata.js";
import { getRestrictionByTitle } from "../repository/geminiCrud.js";
import prisma from "../config/index.js";

// console.log(process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });



export default async function geminiResponse(userMessage?: string) {
  try {
    const restrictions = await getRestrictionByTitle("restrictions")
    if(!restrictions) await prisma.geminiRestriction.create({data: {title: "restrictions", restriction: ""}});

    const today = new Date()
    const localeDateFormat = today.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${restrictions}
      #INFORMAÇÃO DE DATA
      use a data atual para se basear com relação aos dias da semana: ${localeDateFormat}

      #ÚLTIMAS MENSAGENS DA CONVERSA
      * As mensagens do tipo from: me, indicam mensagens enviadas por mim
      * as mensagens do tipo from: client, indicam mensagens enviadas pelo cliente
      * As mensagens do tipo from: bot, indicam mensagens enviadas por você
      * A ordem das mensagens está da mais antiga para a mais nova.
      * A última mensagem deve ser o foco da sua resposta
      * Se não for a primeira interação de vocês, não é necessário se apresentar para o cliente.
      ${userMessage}
      `,
    });
    return response.text;
  } catch (e) {
    console.log(e)
    return "irei repassar você para um atendente"
  }
}