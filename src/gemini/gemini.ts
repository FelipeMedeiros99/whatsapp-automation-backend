import { GoogleGenAI } from "@google/genai";
import "dotenv/config"
import prisma from "../config/index.js";

// console.log(process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function geminiResponse(userMessage?: string) {
  try {
    const mainPromptPromise = prisma.restrictions.findUnique({where: {title: "mainPrompt"}});
    const transferPhrasePromise = prisma.restrictions.findUnique({where: {title: "transferPhrase"}})

    const [mainPrompt, transferPhrase] = await Promise.all([mainPromptPromise, transferPhrasePromise]);


    const today = new Date()
    const localeDateFormat = today.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      ${mainPrompt}
      # *FRASE CHAVE PARA TRANSFERIR PARA ATENDENTE:* ${transferPhrase}

      # INFORMAÇÃO DE DATA
      use a data atual para se basear com relação aos dias da semana: ${localeDateFormat}

      # ÚLTIMAS MENSAGENS DA CONVERSA
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