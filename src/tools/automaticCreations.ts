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

  try {
    await Promise.all(
      defaultRestrictions.map(async (defaultConfig) => {
        await prisma.restrictions.upsert({
          where: {
            title: defaultConfig.title,
          },
          update: {},
          create: defaultConfig
        });
      }))
  } catch (error) {
    console.error("Erro ao verificar/criar restrição padrão:", error);
  }
};