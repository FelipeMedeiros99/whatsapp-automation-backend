// import { Message, Client, LocalAuth } from 'whatsapp-web.js';
import WhatsappWeb, { Message, Client } from "whatsapp-web.js"
import { defaultMessages } from './const.js';
import path from "path";
import { sleep } from '../tools/timeFunctions.js';
import geminiResponse from '../gemini/gemini.js';

const { LocalAuth } = WhatsappWeb;


const longTime = 3000;
const smallTime = 1000;

interface Users {
  [key: string]: {
    timestamp: number;
    isBotStoped: boolean;
    welcome: boolean;
  }
}

class WhatsappService {
  private client: Client;
  private qrCode: string | null = null;
  private isAuthenticated: boolean = false;
  private users: Users = {};

  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "bot-gree-hotel",
        dataPath: path.resolve("sessions")
      }),
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
    });
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
        await this.sendingMessages(message)
      } catch (e) {
        console.log("Erro ao enviar mensagem", e)
      }
    })

    setInterval(() => {
      for (let key of Object.keys(this.users)) {
        if (Math.ceil(Date.now() / 1000) - this.users[key].timestamp > 60 * 60) {
          delete this.users[key]
        }
      }
    }, 60 * 1000)
  }

  async connect(): Promise<string> {
    await this.client.initialize();

    return new Promise((resolve) => {
      const checkQrCode = setInterval(() => {
        if (this.qrCode) {
          clearInterval(checkQrCode);
          resolve(this.qrCode)
        }
      }, 2000);
    });
  }

  public async generateAnoterQrCode() {
    if (this.client) {
      await this.client.destroy();
      return await this.connect()
    }
  }

  public getStatus() {
    return { isLoged: this.isAuthenticated };
  }

  private async sendingMessages(message: Message) {
    const isMe = message.id.fromMe;
    const contentMessage = message.body;
    const messageTo = message.to;
    const messageFrom = message.from;

    console.log({ isMe, contentMessage, messageTo, messageFrom })

    const send = async (text: string, number: string = messageFrom) => {
      await this.client.sendMessage(number, text)
    }


    const gree = "559891402255"
    const felipe = "559887835523"
    const leo = "559884786375"
    if (
      !isMe &&
      messageFrom.includes("@c.us") &&
      contentMessage
    ) {

      // inserindo dados padrão para novas conversas
      if (!this.users[messageFrom]) {
        this.users[messageFrom] = ({ timestamp: message.timestamp, isBotStoped: false, welcome: true });
      }

      if (isMe && contentMessage === "Olá, sou atendente do Gree Hotel, como posso ajudar?") this.users[messageFrom].isBotStoped = true;

      // Reiniciando o bot em caso de finalização
      if (isMe && contentMessage === defaultMessages.finish) {
        this.users[messageFrom].isBotStoped = false;
      }

      if (isMe && contentMessage === defaultMessages.reserved) {

        const response = await geminiResponse("", "confirmReservation") || ""
        const sleepTime = response!.length / 0.004;
        const maxTime = 6000

        await sleep(sleepTime < maxTime ? sleepTime : maxTime);
        await send(response, messageTo)


      }

      // Resposta da IA
      if (!this.users[messageFrom].isBotStoped) {
        const response = await geminiResponse(contentMessage, this.users[messageFrom].welcome ? "welcome" : "default") || ""
        const sleepTime = response!.length / 0.004;
        const maxTime = 5000

        await sleep(sleepTime < maxTime ? sleepTime : maxTime);
        await send(response)

        if (this.users[messageFrom].welcome) this.users[messageFrom].welcome = false
        const messageLowerCase = response.toLocaleLowerCase()
        if (
          messageLowerCase.includes("irei repassar você para um atendente") ||
          (messageLowerCase.includes("repassar") && messageLowerCase.includes("atendente"))) {
          this.users[messageFrom].isBotStoped = true;
        }
      }
    }








    // const desactiveResponse = (number: string) => {
    //   this.users[number] = { ...this.users[number], isBotStoped: true }
    // }

    // const activeResponse = (number: string) => {
    //   if (this.users[number]) delete this.users[number]
    // }

    // if (isMe && contentMessage === defaultMessages.finish) {
    //   activeResponse(messageTo);
    // }

    // if (isMe && contentMessage === defaultMessages.reserved) {
    //   await sleep(smallTime);
    //   await send(defaultMessages?.info, messageTo);
    //   await sleep(smallTime);
    //   await send(defaultMessages?.promotional, messageTo);
    //   await sleep(smallTime);
    //   await send(defaultMessages?.more, messageTo)
    // }

    // && messageFrom.includes("559891402255")

    // if (!isMe && (messageFrom.includes("@c.us") || messageFrom.includes("@lid"))  && messageFrom.includes("559891402255")) {
    //   console.log("1")

    //   if (!this.users[messageFrom]) this.users[messageFrom] = ({ timestamp: message.timestamp, isBotStoped: false, welcome: false, menuAlredSent: false });
    //   console.log("2")
    //   if (!this.users[messageFrom].isBotStoped) {
    //     console.log("3")
    //     const response = await geminiResponse(contentMessage)
    //     console.log(response)
    //     await send(response!)
    //     console.log(response)
    //   }
    // }
  }
}



export const client = new WhatsappService() 