import prisma from "../config/index.js";
import { Request, Response } from "express";

export async function getDefaultMessages(req: Request, res: Response){
  try {

    const default_messages = await prisma.defaultMessages.findMany()
    res.send(default_messages).status(200);
    return;
  } catch (e) {
    throw {message: "Erro ao buscar restrição", statusCode: 500, error: e}
  }
}

export async function updateMessages(req: Request, res: Response){
  try {
    const id = +req.params.id;
    const data = req

    if(!id || !data || !data.body) throw {message: "Id e message são obrigatórios", statuscode: 400}

    const message = await prisma.defaultMessages.update({
      where: {
        id
      },
      data: {
        text: data.body.message
      }
    });

    res.send(message).status(200);
    return;
  } catch (e) {
    throw {message: "Erro ao atualizar mensagem padrão", statusCode: 500, error: e}
  }
}


export async function addDefaultMessage(req: Request, res: Response) {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "O texto da mensagem é obrigatório" });
    }

    const newMessage = await prisma.defaultMessages.create({
      data: {
        text: message,
        key: "FINISH_RESERV"
      }
    });

    return res.status(201).json(newMessage);
  } catch (e) {
    throw { message: "Erro ao criar mensagem padrão", statusCode: 500, error: e };
  }
}


export async function deleteDefaultMessage(req: Request, res: Response) {
  try {
    const id = +req.params.id;

    if (!id) {
      return res.status(400).json({ message: "ID inválido ou não fornecido" });
    }

    await prisma.defaultMessages.delete({
      where: {
        id: id
      }
    });
    return res.status(200).json({ message: "Mensagem removida com sucesso" });
    
  } catch (e) {
    throw { message: "Erro ao deletar mensagem padrão", statusCode: 500, error: e };
  }
}