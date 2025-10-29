import { Request, Response } from "express";
import { getAllRestrictions, updateRestriction } from "../repository/geminiCrud.js";

export async function getRestrictionController(req: Request, res: Response){
  try {
    return await getAllRestrictions()
  } catch (e) {
    throw {message: "Erro ao buscar restrição", statusCode: 500, error: e}
  }
}

export async function updateRestrictionController(req: Request, res: Response){
  try {
    const id = req.params.id;
    const data = req.body

    if(!id || !data) throw {message: "Id e data são obrigatórios", statuscode: 400}
    return await updateRestriction(Number(id), data);
  } catch (e) {
    throw {message: "Erro ao buscar restrição", statusCode: 500, error: e}
  }
}