import { Request, Response } from "express";
import {
  getAllRestrictions,
  getRestrictionByTitle,
  getUsers as getAllUsers,
  toggleActiveIAResponse as updateActiveIAResponse,
  updateRestriction as updateRestrictionRepository,
} from "../repository/geminiCrud.js";
import { order } from "@wppconnect/wa-js";

export async function getRestriction(req: Request, res: Response) {
  try {
    const restrictions = await getAllRestrictions();
    res.send(restrictions);
    return;
  } catch (e) {
    throw { message: "Erro ao buscar restrição", statusCode: 500, error: e };
  }
}

export async function updateRestriction(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!id || !data)
      throw { message: "Id e data são obrigatórios", statuscode: 400 };
    const restriction = await updateRestrictionRepository(Number(id), data);
    res.send(restriction).status(200);
    return;
  } catch (e) {
    throw { message: "Erro ao buscar restrição", statusCode: 500, error: e };
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    res.send(users).status(200);
  } catch (e) {
    throw { message: "Erro ao buscar usuários", statusCode: 500, error: e };
  }
}

export async function toggleActiveIAResponse(req: Request, res: Response) {
  try {
    const number = req.params.number;

    if (!number) throw { message: "Número é obrigatório", statuscode: 400 };
    await updateActiveIAResponse(number);
    return;
  } catch (e) {
    throw { message: "Erro ao buscar restrição", statusCode: 500, error: e };
  }
}
