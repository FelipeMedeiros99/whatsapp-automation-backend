import { Message, Client } from 'whatsapp-web.js';
import { defaultMessages } from './const.js';
import { sleep } from '../tools/timeFunctions.js';
// import { getMessageByTitle } from '../config';
// import { DefaultMessage } from '../generated/prisma';

// const { LocalAuth } = Whatsapp;

interface Users {
  [key: string]: {
    timestamp: number;
    isBotStoped: boolean;
  }
}

class WhatsappService {
  private client: Client;
  private qrCode: string | null = null;
  private isAuthenticated: boolean = false;
  private messages: Message[] = [];
  private users: Users = {};

  constructor() {
    // this.client = new Client({ authStrategy: new LocalAuth() });
    this.client = new Client({puppeteer:{headless: true, args: ['--no-sandbox']}});
    this.setupListeners()
  }

  private setupListeners() {
    this.client.on("qr", (qr) => {
      this.qrCode = qr;
      this.isAuthenticated = false;
    })

    this.client.on("authenticated", () => {
      this.isAuthenticated = true;
      this.qrCode = null;
    })

    this.client.on("ready", () => {
    })

    this.client.on("message_create", async (message) => {
      try {
        await this.sendingMessages(message)
      } catch (e) {
        console.log("Erro ao enviar mensagens: ", e)
      }
    })

    setInterval(() => {
      for (let key of Object.keys(this.users)) {
        if (Math.ceil(Date.now() / 1000) - this.users[key].timestamp > 60 * 60) {
          delete this.users[key]
        }
      }
    }, 60 * 60 * 1000)
  }

  async connect(): Promise<string> {
    await this.client.initialize();

    // if (!this.client.info) {
    // }

    return new Promise((resolve) => {
      const checkQrCode = setInterval(() => {
        if (this.qrCode) {
          clearInterval(checkQrCode);
          resolve(this.qrCode)
        }
      }, 1000);
    });
  }

  public async generateAnoterQrCode() {
    if (this.client) {
      await this.client.destroy();
      return await this.connect()
    }
  }

  // public async getMessage(title: string){
  //   return getMessageByTitle(title)
  // }

  public getStatus() {
    return { isLoged: this.isAuthenticated };
  }

  private async sendingMessages(message: Message) {
    const isMe = message.id.fromMe;
    const contentMessage = message.body;
    const messageTo = message.to;
    const messageFrom = message.from;

    // console.log({ isMe, contentMessage, messageFrom })

    const send = async (text: string, number: string = messageFrom) => {
      await this.client.sendMessage(number, text)
    }

    const desactiveResponse = (number: string) => {
      this.users[number] = { ...this.users[number], isBotStoped: true }
    }

    const activeResponse = (number:string) => {
      if (this.users[number]) delete this.users[number]
    }

    const checkInterruption = () => {
      let isInterruption = true;
      for (let key in defaultMessages) {
        if (defaultMessages[key] === contentMessage) {
          isInterruption = false;
          break;
        }
      }
      if (isInterruption) desactiveResponse(messageTo)

    }

    if (isMe) checkInterruption();

    if (isMe && contentMessage === defaultMessages.finish) {
      activeResponse(messageTo);
    }

    if (isMe && contentMessage === defaultMessages.reserved) {
      await sleep(1000)
      await send(defaultMessages?.info, messageTo);
      await sleep(1000)
      await send(defaultMessages?.promotional)
      await sleep(1000)
      await send(defaultMessages?.finish)
      activeResponse(messageTo)
    }

    // && messageFrom.includes("559891402255")

    if (!isMe && messageFrom.includes("@c.us")) {


      // 1  — Tarifários
      // 2  — Informativos
      // 3  — Reservas
      // 4  — Localização
      // 5  — Solicitar Nota Fiscal
      // 6  — Falar com um atendente

      if (!this.users[messageFrom]) this.users[messageFrom] = ({ timestamp: message.timestamp, isBotStoped: false });

      if (!this.users[messageFrom].isBotStoped) {
        switch (contentMessage.trim()) {
          case "1":
            await send(defaultMessages?.tariffs);
            await send(defaultMessages?.promotional);
            await sleep(3000)
            await send(defaultMessages?.menu);
            break

          case "2":
            await send(defaultMessages?.info);
            await sleep(3000)
            await send(defaultMessages?.menu);
            break;

          case "3":
            await send(defaultMessages?.reservation);
            desactiveResponse(messageFrom);
            break

          case "4":
            await send(defaultMessages?.localization);
            await sleep(3000)
            await send(defaultMessages?.menu);
            break;

          case "5":
            await send(defaultMessages?.invoice);
            desactiveResponse(messageFrom);
            break

          case "6":
            await send(defaultMessages?.wait);
            desactiveResponse(messageFrom);
            break

          default:
            await send(defaultMessages?.start);
            break;
        }
      }
    }
  }
}



export const client = new WhatsappService() 