// import { PrismaClient } from '../generated/prisma'

// const prisma = new PrismaClient()

// export const updateMessage = async(id: number, message: string) =>{
//   try{
//     const update = await prisma.defaultMessage.update({where: {id: id}, data: {message: message}});
//     return update;
//   }catch(e){
//     return(e)
//   }
// }

// export const getAllMessages = async() => {
//   try{
//     const messages = await prisma.defaultMessage.findMany();
//     return messages;
//   }catch(e){
//     return e
//   }
// }

// export const getMessageByTitle = async(title: string) => {
//   try{
//     const message = await prisma.defaultMessage.findFirst({where:{title: title}})
//     return message;
//   }catch(e){
//     return e
//   }
// }