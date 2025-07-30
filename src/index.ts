import express, { json } from "express";
import cors from "cors";
import 'dotenv/config';

import { connectController, getStatusController } from "./controllers/conectionControllers.js";

const app = express()
app.use(cors())
app.use(json())
const PORT = process.env.PORT || 5002

app.get("/whatsapp/connect/", connectController);
app.get("/whatsapp/status/", getStatusController);


app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`server running at port ${PORT}`);
})