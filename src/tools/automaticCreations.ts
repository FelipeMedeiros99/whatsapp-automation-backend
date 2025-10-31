import prisma from "../config/index.js";
import { defaultData } from "../gemini/geminidata.js";
import { getRestrictionByTitle } from "../repository/geminiCrud.js";

export async function createRestrictionsDefault() {
  const defaultRestrictions = [{
    title: "historyLimit",
    value: null,
    numericValue: 8,
    restriction: null,
  },
  {
    title: "transferPhrase",
    value: "Irei repassar você para um atendente",
    numericValue: null,
    restriction: null,
  },
  {
    title: "dbCleanupDays",
    value: null,
    numericValue: 30,
    restriction: null,
  },
  {
    title: "mainPrompt",
    value: "Defina as restrições aqui",
    numericValue: null,
    restriction: defaultData,
  }]

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