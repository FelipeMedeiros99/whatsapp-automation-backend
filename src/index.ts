import express, { json } from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express"
import { client } from "./client"

import 'dotenv/config';
import { getAllMessages, getMessageByTitle, updateMessage } from "./config";

const app = express()
app.use(cors())
app.use(json())
const port = process.env.PORT

app.get("/whatsapp/connect/", async (req: Request, res: Response) => {
  try {
    const qrCode = await client.connect()
    res.send(qrCode);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
});

app.get("/whatsapp/reconnect/", async (req: Request, res: Response) => {
  try {
    const qrCode = await client.generateAnoterQrCode()
    res.send(qrCode);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
});

app.get("/whatsapp/desconnect/", async (req: Request, res: Response) => {
  try {
    const qrCode = await client.generateAnoterQrCode()
    res.send(qrCode);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
});


app.get("/whatsapp/status/", async (req: Request, res: Response) => {
  try {
    const qrCode = client.getStatus()
    res.send(qrCode);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
});

app.get("/whatsapp/messages/", async (req: Request, res: Response) => {
  try {
    const messages = await getAllMessages();
    res.send(messages);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
})

app.get("/whatsapp/messages/:title", async (req: Request, res: Response) => {
  const title = req.params.title
  try {
    const messages = await getMessageByTitle(title);
    res.send(messages);
    return
  } catch (e) {
    res.send(e).status(500)
    return
  }
})

app.put("/whatsapp/messages/update/", async (req: Request, res: Response) => {

  console.log(req.body)
  const { message, id } = req.body;
  console.log(id)
  try{
    const update = await updateMessage(id, message);
    res.send(update)
    return
  }catch(e){
    res.send(e).status(500)
    return
  }
})


app.listen(port, () => {
  console.log(`server running at port ${port}`);
})