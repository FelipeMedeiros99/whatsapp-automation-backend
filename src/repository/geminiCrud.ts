import { GeminiRestriction } from "@prisma/client";
import prisma from "../config/index.js";

export async function createRestriction(title: string, text: string) {
  await prisma.geminiRestriction.create({
  data: { restriction: text, title }
  })
}

export async function updateRestriction(id:number, data: Partial<GeminiRestriction>){
  return await prisma.geminiRestriction.update({
    where: {id},
    data
  })
}


export async function getAllRestrictions() {
  const restrictions = await prisma.geminiRestriction.findMany();
  
  return restrictions.map((r)=>r.restriction).join("\n")
}

export async function getRestrictionByTitle(title: string) {
  const restriction = await prisma.geminiRestriction.findFirst({
    where: {
      title
    }
  });
  
  return restriction?.restriction
}