import express, { json } from "express";
import cors from "cors";
import 'dotenv/config';

import {connectController, getStatusController } from "./controllers/conectionControllers.js";
import { getRestrictionController, updateRestrictionController } from "./controllers/geminiControllers.js";

import { handleErrorMiddleware } from "./middlewares/handleErrorMiddleware.js";
import { createRestrictionsDefault } from "./tools/automaticCreations.js";

const PORT = process.env.PORT || 5002
const app = express()
app.use(cors())
app.use(json())

app.get("/whatsapp/connect/", connectController);
app.get("/whatsapp/status/", getStatusController);

app.get("/whatsapp/restriction/", getRestrictionController)
app.put("/whatsapp/restriction/:id", updateRestrictionController)


app.use(handleErrorMiddleware);

(async()=>{
  await createRestrictionsDefault();
  app.listen(Number(PORT), async () => {
    console.log(`server running at port ${PORT}`);
  })
})()
