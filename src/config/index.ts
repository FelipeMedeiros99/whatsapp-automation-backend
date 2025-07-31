// import { PrismaClient } from '../generated/prisma/index.js'

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
//   const messages = await prisma.defaultMessage.findMany();
//   return messages;

// }

// // export const getMessageByTitle = async(title: string) => {
// //   try{
// //     const message = await prisma.defaultMessage.findFirst({where:{title: title}})
// //     return message;
// //   }catch(e){
// //     return e
// //   }
// // }