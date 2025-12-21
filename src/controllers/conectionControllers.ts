import { client } from "../client/index.js";
import { 
  Request, 
  Response 
} from "express";
import service2 from "../client_2/index.js";

export async function connectController(req: Request, res: Response){
  try {
    const qrCode = await service2.getQrCode();
    console.log(qrCode)
    res.send(qrCode)
    return
  } catch (e) {
    throw {message: "Erro ao se conectar", statusCode: 500, error: e}
  }
}

export async function getStatusController(req: Request, res: Response){
  try {
    // const status = client.getStatus()
    const state = service2.isLoged
    res.send({isLoged: state});
    return;
  } catch (e) {
    throw {message: "Erro ao buscar status", statusCode: 500, error: e}
  }
}

export async function disconnectClientController(req: Request, res: Response){
  try {
    const disconnectResponse = await service2.destroyClient()
    res.send(disconnectResponse);
    return;
  } catch (e) {
    throw {message: "Erro ao desconectar whatsapp", statusCode: 500, error: e}
  }
}