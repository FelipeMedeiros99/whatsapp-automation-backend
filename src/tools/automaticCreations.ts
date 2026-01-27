import { DefaultMessages } from "@prisma/client";
import prisma from "../config/index.js";
import { defaultData } from "../iaResponse/iaData.js";
import { getRestrictionByTitle } from "../repository/geminiCrud.js";

export async function createRestrictionsDefault() {
  const defaultRestrictions = [
    {
      title: "historyLimit",
      restriction: null,
      restrictionNumber: 8
    },
    {
      title: "transferPhrase",
      restriction: "Irei repassar você para um atendente",
      restrictionNumber: null
    },
    {
      title: "dbCleanupDays",
      restriction: null,
      restrictionNumber: 30
    },
    {
      title: "mainPrompt",
      restriction: "Defina as restrições",
      restrictionNumber: null
    },
    {
      title: "responseDelay",
      restriction: null, 
      restrictionNumber: 3.5 
    }

  
  ]

  const defaultFinishMessage: Omit<DefaultMessages, "id">[] = [
    {
      text: `🏨 *Informativos do Gree Hotel* 🏨

- Café da manhã incluso
- Garagem rotativa *(vagas limitadas)*
- Crianças até 3 anos não pagam
- Wi-Fi gratuito
- Piscina disponível das 6h às 18h
- Quartos triplos e quádruplos com 2 camas de casal
- Não aceitamos pets

🕒 *Check-In*: A partir das 14h
🕛 *Check-Out*: Até às 12h

🌐 Site oficial: www.greehotel.com.br
📩 Reservas corporativas: reservasgree@gmail.com`,
      key: "FINISH_RESERV",

    },

    {
      text: `Desconto de R$ 20,00 em cada diária para pagamento com dinheiro em espécie.`,
      key: "FINISH_RESERV"
    },

    {
      text: `Podemos ajudar em algo mais?`,
      key: "FINISH_RESERV",
    }
  ]


  try {
    await Promise.all(
      defaultRestrictions.map(async (defaultConfig) => {
        console.log("inserindo restriçções no banco...")
        await prisma.restrictions.upsert({
          where: {
            title: defaultConfig.title,
          },
          update: {},
          create: defaultConfig
        });        
        console.log("restrições inseridas")
      }))

      console.log("Inserindo mensagens de confirmação de reserva padrão")
      const messages = await prisma.defaultMessages.findMany();
      if(messages.length === 0){
        await prisma.defaultMessages.createMany({
          data: defaultFinishMessage
        })
      }
      console.log("mensagens padrão inseridas")
  } catch (error) {
    console.error("Erro ao verificar/criar restrição padrão:", error);
  }
};