import express from "express";
import cors from "cors";
import {Request, Response, NextFunction} from "express"
import {client} from "./client"

import 'dotenv/config';

const app = express()
app.use(cors())
const port = process.env.PORT

app.get("/whatsapp/connect/", async(req: Request, res: Response)=>{
  try{
    const qrCode = await client.connect()
    res.send(qrCode);
  }catch(e){
    res.send(e).status(500)
  }
});

app.get("/whatsapp/reconnect/", async(req: Request, res: Response)=>{
  try{
    const qrCode = await client.generateAnoterQrCode()
    res.send(qrCode);
  }catch(e){
    res.send(e).status(500)
  }
});

app.get("/whatsapp/desconnect/", async(req: Request, res: Response)=>{
  try{
    const qrCode = await client.generateAnoterQrCode()
    res.send(qrCode);
  }catch(e){
    res.send(e).status(500)
  }
});


app.get("/whatsapp/status/", async(req: Request, res: Response)=>{
  try{
    const qrCode = client.getStatus()
    res.send(qrCode);
  }catch(e){
    res.send(e).status(500)
  }
});

app.listen(port, ()=>{
  console.log(`server running at port ${port}`);
})