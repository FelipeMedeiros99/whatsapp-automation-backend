import { Client } from "whatsapp-web.js"

import { deleteUser, findAllUser, updateUser } from "../repository/userCrud.js";
import replyMessage from "./replyMessage.js";
import clearDb from "./clearDb.js";

const oneHour = 60 * 60 * 1000
const oneDay = oneHour * 24

const clientConfig = {
  puppeteer: {
    headless: true, args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-extensions'
    ]
  }
}

class WhatsappService {
  private client: Client;
  private qrCode: string | null = null;
  private isAuthenticated: boolean = false;

  constructor() {
    this.client = new Client(clientConfig);
    this.setupListeners()
  }

  private setupListeners() {
    this.client.on("qr", (qr) => {
      this.qrCode = qr;
      this.isAuthenticated = false;
    })

    this.client.on("authenticated", () => {
      console.log("autenticado")
      this.isAuthenticated = true;
      this.qrCode = null;
    })

    this.client.on("disconnected", (reason) => {
      console.log("desconectado");
      console.log("Motivo:", reason);
      this.isAuthenticated = false;
    });

    this.client.on("ready", () => {
      console.log("cliente ready")
    })

    this.client.on("message_create", async (message) => {
      try {
        await replyMessage(message, this.client)
      } catch (e) {
        console.log("Erro ao enviar mensagem", e)
      }
    })

    clearDb()

    setInterval(async () => {
      // Reativando chat depois de 2h sem conversa
      const users = await findAllUser();
      if (!users) return;
      for (let user of users) {
        if (Date.now() - Number(user.timestamp) * 1000 > oneHour * 2) {
          await updateUser(user.number, { isBotStoped: false })
        }
      }
    }, oneDay)
  }

  async connect(): Promise<string> {
    try {
      if (this.client && this.client.info && this.client.destroy) {
        this.client.destroy()
      }
      await this.client.initialize();

      return new Promise((resolve) => {
        const checkQrCode = setInterval(() => {
          if (this.qrCode) {
            clearInterval(checkQrCode);
            resolve(this.qrCode)
          }
        }, 2000);
      });
    } catch (e) {
      console.log("Erro ao tentear se conectar", e)
      return ("erro ao tentar se conectar")
    }
  }

  public async generateAnoterQrCode() {
    if (this.client) {
      await this.client.destroy();

      this.client = new Client(clientConfig)
      this.setupListeners()

      return await this.connect();
    }
  }

  public getStatus() {
    return { isLoged: this.isAuthenticated };
  }
}

export const client = new WhatsappService() 