import { client } from "../client/index.js";
import { 
  // NextFunction, 
  Request, 
  Response 
} from "express";

// import { getAllMessagesRepository, updateMessageRepository } from "../repositories/messagesRepository.js";


export async function connectController(req: Request, res: Response){
  try {
    const qrCode = await client.connect()
    res.send(qrCode);
    return
  } catch (e) {
    throw {message: "Erro ao se conectar", statusCode: 500, error: e}
  }
}

export async function getStatusController(req: Request, res: Response){
  try {
    const status = client.getStatus()
    res.send(status);
    return;
  } catch (e) {
    throw {message: "Erro ao buscar status", statusCode: 500, error: e}
  }
}

// export async function getAllMessagesController(req: Request, res: Response){
//   try {
//     const messages = await getAllMessagesRepository()
//     res.send(messages)
//   } catch (e) {
//     throw {message: "Erro ao buscar mensagens", status: 500, error: e}
//   }
// }

// export async function updateMessageController(req: Request, res: Response){
//   try {
//     const {id, message} = req?.body;
//     if(!id || !message){
//       throw "O corpo da request deve possuir o formato {id: number, message: string}"
//     }
//     const messages = await updateMessageRepository(id, message)
//     res.send(messages);
//     return;
//   } catch (e) {
//     throw {message: "Erro ao atualizar mensagem", status: 500, error: e}
//   }
// }