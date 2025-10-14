// import { Message, Client, LocalAuth } from 'whatsapp-web.js';
import { Message, Client } from "whatsapp-web.js"
import { defaultMessages } from './const.js';
import { sleep } from '../tools/timeFunctions.js';
import geminiResponse from '../gemini/gemini.js';
import prisma from "../config/index.js";
import { createUser, deleteUser, findAllUser, findUser, updateUser } from "../repository/user.js";
import { createMessage, findMessage } from "../repository/message.js";



const longTime = 3000;
const smallTime = 1000;
const oneHour = 60 * 60 * 1000

const clientConfigs = {
  puppeteer: {
    headless: true, args: [
      //'--no-sandbox',
      // '--disable-setuid-sandbox',
      // '--disable-dev-shm-usage',
      // '--disable-accelerated-2d-canvas',
      // '--disable-gpu',
      // '--no-first-run',
      // '--no-zygote',
      // '--single-process',
      // '--disable-extensions'
    ]
  }
}

interface Users {
  [key: string]: {
    timestamp: number;
    isBotStoped: boolean;
    welcome: boolean;
    messageFromBot: boolean
  }
}

class WhatsappService {
  private client: Client;
  private qrCode: string | null = null;
  private isAuthenticated: boolean = false;
  private users: Users = {};

  constructor() {
    this.client = new Client({
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

    setInterval(async() => {
      const users = await findAllUser();
      if(!users) return;
      for (let user of users) {
        if (Math.ceil(Date.now() / 1000) - Number(user.timestamp) > 60 * 60) {
          await deleteUser(user.number)
        }
      }
    }, oneHour)
  }

  async connect(): Promise<string> {
    try{
      if(this.client && this.client.info && this.client.destroy){
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
    }catch(e){
      console.log("Erro ao tentear se conectar")
      return("erro ao tentar se conectar")
    }
  }

  public async generateAnoterQrCode() {
    if (this.client) {
      await this.client.destroy();

      this.client = new Client(clientConfigs)
      this.setupListeners()

      return await this.connect();
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
      this.users[number] = {...this.users[number], timestamp: message.timestamp}
      try{
        await this.client.sendMessage(number, text)
      }catch(e){
        console.log("erro ao enviar mensagem: ", e)
      }
    }


    const gree = "559891402255"
    const felipe = "559887835523"
    const leo = "559884786375"

    // restrições para quando a mensagem for enviada pelo atendente
    if (isMe) {
      
      let userData = await createUser({
        number: messageTo,
        wasWelcome: true,
        timestamp: BigInt(message.timestamp),
        isBotStoped: false,
        lastMessageFromBot: false,
      })

      
      if (contentMessage === defaultMessages.finish) {
        userData = await updateUser(messageTo, {isBotStoped: false, lastMessageFromBot: true});
      }

      if (contentMessage === defaultMessages.reserved) {
        await send(defaultMessages?.info, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.promotional, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.more, messageTo)
      }

      if(!userData?.lastMessageFromBot){
        await updateUser(messageTo, {isBotStoped: true})
      }

      await updateUser(messageTo, {lastMessageFromBot: false})
      await createMessage({userNumber: messageTo, text: contentMessage, from: "me"})
    }

    if (
      !isMe &&
      messageFrom.includes("@c.us") &&
      contentMessage 
      // && messageFrom.includes(felipe)
    ) {
      // inserindo dados padrão para novas conversas
      const userData = await createUser({
        number: messageFrom,
        wasWelcome: true,
        timestamp: BigInt(message.timestamp),
        isBotStoped: false,
        lastMessageFromBot: false,
      })

      if(!userData) return

      await createMessage({userNumber: messageFrom, from: "client", text: contentMessage});
      
      const messagesData = await findMessage(messageFrom) || []

      
      if (!userData.isBotStoped) {
        await updateUser(messageFrom, { lastMessageFromBot: true })
        const messageContext = messagesData?.map((msg:{from: string, text: string})=>`${msg.from}: ${msg.text}`).join("/n")

        const response = await geminiResponse(messageContext, userData.wasWelcome ? "welcome" : "default") || ""
        
        await sleep(3500);
        await send(response);
        await updateUser(messageFrom, {isBotStoped: false})

        if (userData.wasWelcome) await updateUser(userData.number, { wasWelcome: false });
        
        if (response.toLocaleLowerCase().includes("irei repassar você para um atendente")) {
          await updateUser(messageFrom, { isBotStoped: true })
        }
      }
    }
  }
}



export const client = new WhatsappService() 