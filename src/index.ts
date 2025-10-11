import express, { json } from "express";
import cors from "cors";
import 'dotenv/config';

import { 
  connectController, 
  getStatusController, 
  // getAllMessagesController, 
  // updateMessageController 
} from "./controllers/conectionControllers.js";
import { handleErrorMiddleware } from "./middlewares/handleErrorMiddleware.js";

const PORT = process.env.PORT || 5002
const app = express()
app.use(cors())
app.use(json())

app.get("/whatsapp/connect/", connectController);
app.get("/whatsapp/status/", getStatusController);

app.use(handleErrorMiddleware);

app.listen(Number(PORT), () => {
  console.log(`server running at port ${PORT}`);
})
