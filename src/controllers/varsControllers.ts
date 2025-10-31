import { Request, Response } from 'express';
import { findAllVars, setVar } from "../repository/varsCrud.js"
import { Vars } from '@prisma/client';

export async function getAllVarsController(req: Request, res: Response) {
  try {
    const allVars = await findAllVars();
    return res.send(allVars).status(200);
  } catch (e) {
    throw { message: "Erro ao buscar todas as variáveis", statusCode: 500, error: e };
  }
}

export async function updateVarController(req: Request, res: Response) {
  try {
    const data: Omit<Vars, "id"> = req.body;
    if (!data || !data.title) {
      throw { message: "O campo 'title' é obrigatório.", statusCode: 400 };
    }
    const updatedVar = await setVar(data);
    return res.send(updatedVar).status(200);

  } catch (e) {
    throw {message: "Erro ao atualizar", error: e}
  }
}