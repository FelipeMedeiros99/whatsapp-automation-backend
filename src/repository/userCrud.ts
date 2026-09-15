import { User } from "@prisma/client";
import prisma from "../config/index.js";
import { timeStamp } from "console";
import { join } from "path";

export async function findAllUser() {
  try {
    return await prisma.user.findMany({
      select: {
        number: true,
        timestamp: true,
      },
    });
  } catch (e) {
    console.error("Erro ao buscar user: ", e);
  }
}

export async function findUser(number: string) {
  try {
    return await prisma.user.findFirst({
      where: { number },
    });
  } catch (e) {
    console.error("Erro ao buscar user: ", e);
  }
}

export async function createUser(data: User) {
  let updateData: { timestamp: bigint; name?: string } = {
    timestamp: data.timestamp,
  };

  if (data.name) updateData.name = data.name;

  try {
    return await prisma.user.upsert({
      where: {
        number: data.number,
      },
      update: updateData,

      create: data,
    });
  } catch (e) {
    console.error("Erro ao criar user: ", e);
  }
}

export async function updateUser(number: string, data: Partial<User>) {
  try {
    return await prisma.user.update({
      where: {
        number: number,
      },
      data,
    });
  } catch (e) {
    console.error("Erro ao atualizar user: ", e);
  }
}

export async function deleteUser(number: string) {
  try {
    await prisma.user.delete({ where: { number } });
  } catch (e) {
    console.error("Erro ao deletar usuário: ", e);
  }
}
