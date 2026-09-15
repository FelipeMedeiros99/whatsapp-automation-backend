import { Request, Response } from "express";
import {
  getAllRestrictions,
  getRestrictionByTitle,
  getUsers as getAllUsers,
  toggleActiveIAResponse as updateActiveIAResponse,
  updateRestriction as updateRestrictionRepository,
  deleteNumber as deleteNum,
  createBotRuleRepository,
  getAllBotRulesRepository,
  getBotRuleByIdRepository,
  updateBotRuleRepository,
  deleteBotRuleRepository,
} from "../repository/geminiCrud.js";

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
    res.send(restriction).sendStatus(200);
    return;
  } catch (e) {
    throw { message: "Erro ao buscar restrição", statusCode: 500, error: e };
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsers();
    res.send(users).sendStatus(200);
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

export async function deleteUser(req: Request, res: Response) {
  try {
    const number = req.params.number;
    if (!number) throw { message: "Número é obrigatório", statuscode: 400 };
    await deleteNum(number);
    return;
  } catch (e) {}
}

export async function createBotRule(req: Request, res: Response) {
  try {
    const data = req.body;

    if (!data || !data.title)
      throw { message: "O título é obrigatório", statuscode: 400 };

    const newRule = await createBotRuleRepository(data);
    res.send(newRule).status(200);
    return;
  } catch (e) {
    throw { message: "Erro ao criar regra do bot", statusCode: 500, error: e };
  }
}

export async function getBotRules(req: Request, res: Response) {
  try {
    const rules = await getAllBotRulesRepository();
    res.send(rules).status(200);
    return;
  } catch (e) {
    throw {
      message: "Erro ao buscar regras do bot",
      statusCode: 500,
      error: e,
    };
  }
}

export async function getBotRuleById(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id) throw { message: "Id é obrigatório", statuscode: 400 };

    const rule = await getBotRuleByIdRepository(Number(id));
    res.send(rule).status(200);
    return;
  } catch (e) {
    throw { message: "Erro ao buscar regra", statusCode: 500, error: e };
  }
}

export async function updateBotRule(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const data = req.body;

    if (!id || !data)
      throw { message: "Id e data são obrigatórios", statuscode: 400 };

    const updatedRule = await updateBotRuleRepository(Number(id), data);
    res.send(updatedRule).status(200);
    return;
  } catch (e) {
    throw { message: "Erro ao atualizar regra", statusCode: 500, error: e };
  }
}

export async function deleteBotRule(req: Request, res: Response) {
  try {
    const id = req.params.id;

    if (!id) throw { message: "Id é obrigatório", statuscode: 400 };

    await deleteBotRuleRepository(Number(id));
    return;
  } catch (e) {
    throw { message: "Erro ao deletar regra", statusCode: 500, error: e };
  }
}
