import { client } from "../client/index.js";
import { 
  Request, 
  Response 
} from "express";

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