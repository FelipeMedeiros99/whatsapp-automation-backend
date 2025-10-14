import { Message } from "@prisma/client";
import prisma from "../config/index.js";

export async function findMessage(number: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        userNumber: number
      },
      select: {
        text: true,
        from: true
      },
      orderBy: {date: "desc"},
      take: 8,
    });

    return messages.reverse();
  } catch (e) {
    console.error("Erro ao buscar message: ", e)
  }
}


export async function createMessage(data: Omit<Message, "id" | "date">) {
  try {
    await prisma.message.create({data})
  } catch (e) {
    console.error("Erro ao criar message: ", e)
    return {}
  }
}