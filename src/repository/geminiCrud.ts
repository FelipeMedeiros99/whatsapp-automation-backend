import { Restrictions } from "@prisma/client";
import prisma from "../config/index.js";

export async function createRestriction(title: string, text: string) {
  await prisma.restrictions.create({
  data: { restriction: text, title }
  })
}

export async function updateRestriction(id:number, data: Partial<Restrictions>){
  return await prisma.restrictions.update({
    where: {id},
    data
  })
}


export async function getAllRestrictions() {
  const restrictions = await prisma.restrictions.findMany();
  return restrictions;
}

export async function getRestrictionByTitle(title: string) {
  const restriction = await prisma.restrictions.findFirst({
    where: {
      title
    }
  });
  
  return restriction
}