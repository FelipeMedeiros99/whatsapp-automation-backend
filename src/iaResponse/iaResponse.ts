import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import "dotenv/config"
import prisma from "../config/index.js";

// console.log(process.env.GEMINI_API_KEY)
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const deepseek = new OpenAI({baseURL: 'https://api.deepseek.com', apiKey: process.env.DEEPSEEK_API_KEY});

export default async function iaResponse(userMessage?: string) {
  try {
    const mainPromptPromise = prisma.restrictions.findUnique({where: {title: "mainPrompt"}});
    const transferPhrasePromise = prisma.restrictions.findUnique({where: {title: "transferPhrase"}})

    const [mainPrompt, transferPhrase] = await Promise.all([mainPromptPromise, transferPhrasePromise]);


    const today = new Date()
    const localeDateFormat = today.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })
    
    const content = `
      ${mainPrompt?.restriction}
      # *FRASE CHAVE PARA TRANSFERIR PARA ATENDENTE:* ${transferPhrase?.restriction}

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
      `
    try{
      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
      });

      return response.text;
    }catch(e){

      const response = await deepseek.chat.completions.create({
        messages: [{role: "system", content}],
        model: "deepseek-chat"
    });
    
      return response.choices[0].message.content;
    }
  } catch (e) {
    console.log(e)
    return ""
  }
}
