import express, { json } from "express";
import cors from "cors";
import 'dotenv/config';

import { 
  connectController, 
  getStatusController, 
  // getAllMessagesController, 
  // updateMessageController 
} from "./controllers/conectionControllers.js";
import { getRestrictionController, updateRestrictionController } from "./controllers/geminiControllers.js";

import { handleErrorMiddleware } from "./middlewares/handleErrorMiddleware.js";
import { getRestrictionByTitle } from "./repository/geminiCrud.js";
import prisma from "./config/index.js";
import { getAllVarsController, updateVarController } from "./controllers/varsControllers.js";

const createRestriction = async () => {
  try {
    console.log("Verificando/Criando restrição padrão...");
    const restrictions = await getRestrictionByTitle("restrictions");
    if (!restrictions) {
      await prisma.geminiRestriction.create({ data: { title: "restrictions", restriction: "" } });
      console.log("Restrição padrão criada com sucesso.");
    } else {
      console.log("Restrição padrão já existe.");
    }
  } catch (error) {
    console.error("Erro ao verificar/criar restrição padrão:", error);
  }
};

const PORT = process.env.PORT || 5002
const app = express()
app.use(cors())
app.use(json())

app.get("/whatsapp/connect/", connectController);
app.get("/whatsapp/status/", getStatusController);

app.get("/whatsapp/restriction/", getRestrictionController)
app.put("/whatsapp/restriction/:id", updateRestrictionController)

app.get("/whatsapp/vars", getAllVarsController)
app.post("/whatsapp/vars", updateVarController)


app.use(handleErrorMiddleware);

(async()=>{
  await createRestriction()
  app.listen(Number(PORT), async () => {
    console.log(`server running at port ${PORT}`);
  })
})()
