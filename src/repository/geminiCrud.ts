import { Restrictions } from "@prisma/client";
import prisma from "../config/index.js";

export async function createRestriction(title: string, text: string) {
  await prisma.restrictions.create({
    data: { restriction: text, title },
  });
}

export async function updateRestriction(
  id: number,
  data: Partial<Restrictions>,
) {
  return await prisma.restrictions.update({
    where: { id },
    data,
  });
}

export async function getAllRestrictions() {
  const restrictions = await prisma.restrictions.findMany();
  return restrictions;
}

export async function getRestrictionByTitle(title: string) {
  const restriction = await prisma.restrictions.findFirst({
    where: {
      title,
    },
  });

  return restriction;
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      timestamp: "desc",
    },
  });
  const updateUsersTimestamp = users.map((user) => ({
    ...user,
    timestamp: String(user.timestamp),
  }));

  return updateUsersTimestamp;
}

export async function toggleActiveIAResponse(number: string) {
  const user = await prisma.user.findUnique({
    where: { number: number },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  await prisma.user.update({
    where: { number: number },
    data: { isBotStoped: !user.isBotStoped },
  });

  return await prisma.user.findMany();
}

export async function deleteNumber(number: string) {
  const user = await prisma.user.findUnique({
    where: { number: number },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  await prisma.user.delete({
    where: { number: number },
  });

  return await prisma.user.findMany();
}
