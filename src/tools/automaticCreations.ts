import prisma from "../config/index.js";
import { getRestrictionByTitle } from "../repository/geminiCrud.js";

export async function createRestrictionsDefault() {
  try {
    console.log("Verificando/Criando restrição padrão...");
    const restrictions = await getRestrictionByTitle("restrictions");
    if (!restrictions) {
      await prisma.geminiRestriction.create({ data: { title: "restrictions", restriction: "" } });
      console.log("Restrição padrão criada com sucesso.");
    } else {
      console.log("Restrição padrão já existe.");
    }
  } catch (error) {
    console.error("Erro ao verificar/criar restrição padrão:", error);
  }
};


export async function findVar(title: string) {
  try {
    return await prisma.vars.findUnique({
      where: {
        title: title,
      },
    });
  } catch (error) {
    console.log("Erro ao criar vars: ", error)
  }
}


const defaultVars = [
  {
    title: "Contexto de mensagens",
    value: null,
    numericValue: 8
  },
  {
    title: "Frase de transferência para atendente humano",
    value: "Irei repassar você para um atendente",
    numericValue: null
  },
  {
    title: "Limpeza do banco",
    value: null,
    numericValue: 30
  }
];

export async function createDefaultVars() {
  try {
    await prisma.vars.createMany({data: defaultVars});
  }catch (error) {
      console.error("Erro ao inicializar variáveis padrão:", error);
  }
};