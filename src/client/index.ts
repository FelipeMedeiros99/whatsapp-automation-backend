// import { Message, Client, LocalAuth } from 'whatsapp-web.js';
import { Message, Client } from "whatsapp-web.js"
import { defaultMessages } from './const.js';
import { sleep } from '../tools/timeFunctions.js';
import geminiResponse from '../gemini/gemini.js';
import prisma from "../config/index.js";
import { createUser, deleteUser, findAllUser, findUser, updateUser } from "../repository/user.js";
import { createMessage, findMessage } from "../repository/message.js";
import { User } from "@prisma/client";



const longTime = 3000;
const smallTime = 1000;
const oneHour = 60 * 60 * 1000
const oneDay = oneHour * 24

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
  // private users: Users = {};

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

    setInterval(async () => {
      // limpando banco depois de 1 mês de inatividade
      const users = await findAllUser();
      if (!users) return;
      for (let user of users) {
        if (Date.now() - Number(user.timestamp) * 1000 > oneDay * 30 /** apagar depopis de 1 mês */) {
          await deleteUser(user.number)
        }
      }
    }, oneDay)

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
      console.log("Erro ao tentear se conectar")
      return ("erro ao tentar se conectar")
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
      // this.users[number] = { ...this.users[number], timestamp: message.timestamp }
      try {
        await this.client.sendMessage(number, text)
      } catch (e) {
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
        timeoutId: null
      })

      let userUpdateData: Partial<User> = {lastMessageFromBot: false}


      if (contentMessage === defaultMessages.finish) {
        userUpdateData.isBotStoped = false;
        userUpdateData.lastMessageFromBot = true;
        // userData = await updateUser(messageTo, { isBotStoped: false, lastMessageFromBot: true });
      }

      if (contentMessage === defaultMessages.reserved) {
        await sleep(smallTime)
        await send(defaultMessages?.info, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.promotional, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.more, messageTo)
      }

      if (!userData?.lastMessageFromBot) {
        userUpdateData.isBotStoped = true;
        // await updateUser(messageTo, { isBotStoped: true })
      }

      await Promise.all([updateUser(messageTo, userUpdateData), createMessage({ userNumber: messageTo, text: contentMessage, from: "me" })]);
    }

    if (
      !isMe &&
      messageFrom.includes("@c.us") &&
      contentMessage
    ) {
      // inserindo dados padrão para novas conversas
      const userDataPromise = createUser({
        number: messageFrom,
        wasWelcome: true,
        timestamp: BigInt(message.timestamp),
        isBotStoped: false,
        lastMessageFromBot: false,
        timeoutId: null
      })
      const createMessagePromise = createMessage({ userNumber: messageFrom, from: "client", text: contentMessage });

      const [userData] = await Promise.all([userDataPromise, createMessagePromise]);
      
      if (!userData) return


      if (!userData.isBotStoped) {
        if(userData.timeoutId){
          clearTimeout(userData.timeoutId)
        }
        // Evitando resposta unica para mensagens repartidas
        const userTimeout = setTimeout(async () => {
          try {
            const updateTimeoutuser = updateUser(messageFrom, {timeoutId: null})
            const messagesData = await findMessage(messageFrom)
            if (!messagesData) {
              await updateTimeoutuser;
              return;
            }

            if (messagesData[messagesData.length - 1]?.from === "client") {

              let updateUserData: Partial<User> = { isBotStoped: false, lastMessageFromBot: true, timeoutId: null }

              const messageContext = messagesData?.map((msg: { from: string, text: string }) => `${msg.from}: ${msg.text}`).join("/n")

              const geminiPromise = geminiResponse(messageContext, userData.wasWelcome ? "welcome" : "default")

              await updateTimeoutuser;
              const response = await geminiPromise || "";
              await send(response);

              if (userData.wasWelcome) updateUserData.wasWelcome = false;

              if (response.toLocaleLowerCase().includes("irei repassar você para um atendente")) {
                updateUserData.isBotStoped = true;
              }

              await updateUser(messageFrom, updateUserData)
            }

          } catch (e) {
            console.log("erro ao enviar mensagem: ", e)
          }

          
        }, 1500);
        await updateUser(messageFrom, {timeoutId: Number(userTimeout)})
      }
    }
  }
}



export const client = new WhatsappService() 