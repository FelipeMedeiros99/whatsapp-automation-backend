import prisma from "../config/index.js";
import { Vars } from "@prisma/client";

export async function setVar(data: Omit<Vars, "id">) {
  try {
    return await prisma.vars.upsert({
      where: {
        title: data.title, 
      },
      update: {
        value: data.value,
        numericValue: data.numericValue,
      },
      create: data,
    });
  } catch (error) {
    console.error(`Erro ao salvar a variável '${data.title}':`, error);
    return null;
  }
}

export async function findVar(title: string) {
  try {
    return await prisma.vars.findUnique({
      where: {
        title: title,
      },
    });
  } catch (error) {
    console.error(`Erro ao buscar a variável '${title}':`, error);
    return null;
  }
}

export async function findAllVars() {
  try {
    return await prisma.vars.findMany();
  } catch (error) {
    console.error("Erro ao buscar todas as variáveis:", error);
    return [];
  }
}

export async function deleteVar(title: string) {
  try {
    return await prisma.vars.delete({
      where: {
        title: title,
      },
    });
  } catch (error) {
    console.error(`Erro ao deletar a variável '${title}':`, error);
    return null;
  }
}