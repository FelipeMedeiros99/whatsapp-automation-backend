import { client } from "../client";
import { Request, Response } from "express";


export async function connectController (req: Request, res: Response){
  try {
    console.log("request to connect")
    const qrCode = await client.connect()
    console.log("qr-code generated: ", qrCode)
    res.send(qrCode);
    return
  } catch (e) {
    console.log("erro ao conectar: ", e)
    res.send(e).status(500)
    return
  }
}

export async function getStatusController(req: Request, res: Response){
  try {
    const qrCode = client.getStatus()
    res.send(qrCode);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
}