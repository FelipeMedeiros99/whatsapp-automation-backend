import express, { json } from "express";
import cors from "cors";
import "dotenv/config";

import {
  connect,
  disconnectClient,
  getStatus,
} from "./controllers/conection.js";
import {
  deleteUser,
  getRestriction,
  getUsers,
  toggleActiveIAResponse,
  updateRestriction,
  createBotRule,
  getBotRules,
  getBotRuleById,
  updateBotRule,
  deleteBotRule,
} from "./controllers/ia.js";

import { handleErrorMiddleware } from "./middlewares/handleErrorMiddleware.js";
import { createRestrictionsDefault } from "./tools/automaticCreations.js";
import {
  addDefaultMessage,
  deleteDefaultMessage,
  getDefaultMessages,
  updateMessages,
} from "./controllers/message.js";

const PORT = process.env.PORT || 5002;
const app = express();
app.use(cors());
app.use(json());

const baseUrl = process.env.BASE_URL || "/whatsapp/";

app.get("/", (req, res) => res.send("Hello World!"));

app.get(`${baseUrl}connect/`, connect);
app.get(`${baseUrl}disconnect/`, disconnectClient);
app.get(`${baseUrl}status/`, getStatus);

app.get(`${baseUrl}restriction/`, getRestriction);
app.put(`${baseUrl}restriction/:id`, updateRestriction);

app.get(`${baseUrl}default_messages/`, getDefaultMessages);
app.put(`${baseUrl}default_messages/:id`, updateMessages);
app.post(`${baseUrl}default_messages/`, addDefaultMessage);
app.delete(`${baseUrl}default_messages/:id`, deleteDefaultMessage);

app.get(`${baseUrl}users/`, getUsers);
app.put(`${baseUrl}users/:number`, toggleActiveIAResponse);
app.delete(`${baseUrl}users/:number`, deleteUser);

// Criação e Listagem operam na raiz do recurso
app.post(`${baseUrl}bot-rules/`, createBotRule);
app.get(`${baseUrl}bot-rules/`, getBotRules);

// Leitura, Atualização e Deleção operam em um item específico via :id
app.get(`${baseUrl}bot-rules/:id`, getBotRuleById);
app.put(`${baseUrl}bot-rules/:id`, updateBotRule);
app.delete(`${baseUrl}bot-rules/:id`, deleteBotRule);

app.use(handleErrorMiddleware);

(async () => {
  // setting database restrictions

  await createRestrictionsDefault();
  app.listen(Number(PORT), async () => {
    console.log(`server running at port ${PORT}`);
  });
})();
