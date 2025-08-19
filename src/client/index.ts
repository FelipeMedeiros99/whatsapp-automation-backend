import { Message, Client } from 'whatsapp-web.js';
import { defaultMessages } from './const.js';
import { sleep } from '../tools/timeFunctions.js';
import { writeLogs } from '../tools/archivesFunctions.js';
import "dotenv/config"
// import { getMessageByTitle } from '../config';
// import { DefaultMessage } from '../generated/prisma';

// const { LocalAuth } = Whatsapp;

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
    menuAlredSent: boolean;
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
    this.client = new Client(clientConfigs);
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

    // this.client.on("ready", () => {
    // })

    this.client.on("message_create", async (message) => {
      try {
        await this.sendingMessages(message)
      } catch (e) {
        throw { message: "Erro ao enviar mensagem", statusCode: 404 }
      }
    })

    //TODO
    setInterval(() => {
      for (let key of Object.keys(this.users)) {
        if (Date.now() - (this.users[key].timestamp * 1000) > (1 * oneHour)) {
          delete this.users[key]
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

    // writeLogs(JSON.stringify({id: message.id, text: message.body}));


    const send = async (text: string, number: string = messageFrom) => {
      this.users[number] = {...this.users[number], timestamp: message.timestamp}
      try{
        await this.client.sendMessage(number, text)
      }catch(e){
        console.log("erro ao enviar mensagem: ", e)
      }
    }

    const desactiveResponse = (number: string) => {
      this.users[number] = { ...this.users[number], isBotStoped: true }
    }

    const activeResponse = (number: string) => {
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
        this.users[messageTo] = {...this.users[messageTo], menuAlredSent: true};
        await sleep(smallTime);
        await send(defaultMessages?.info, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.promotional, messageTo);
        await sleep(smallTime);
        await send(defaultMessages?.more, messageTo)
    }

    // && messageFrom.includes("559891402255")

    if (!isMe && messageFrom.includes("@c.us")) {


      // 1  — Tarifários
      // 2  — Informativos
      // 3  — Reservas
      // 4  — Localização
      // 5  — Solicitar Nota Fiscal
      // 6  — Falar com um atendente

      if (!this.users[messageFrom]) this.users[messageFrom] = ({ timestamp: message.timestamp, isBotStoped: false, welcome: false, menuAlredSent: false });

      if (!this.users[messageFrom].isBotStoped) {        
        switch (contentMessage.trim()) {
          case "1":
            await send(defaultMessages?.tariffs);
            await send(defaultMessages?.promotional);
            await sleep(longTime)
            await send(defaultMessages?.menu);
            this.users[messageFrom] = {...this.users[messageFrom], menuAlredSent: false};
            break

          case "2":
            await send(defaultMessages?.info);
            await sleep(longTime)
            await send(defaultMessages?.menu);
            this.users[messageFrom] = {...this.users[messageFrom], menuAlredSent: false};
            break;

          case "3":
            await send(defaultMessages?.reservation);
            desactiveResponse(messageFrom);
            break

          case "4":
            await send(defaultMessages?.localization);
            await sleep(longTime)
            await send(defaultMessages?.menu);
            this.users[messageFrom] = {...this.users[messageFrom], menuAlredSent: false};
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
            if(contentMessage.length > 0){
              if(!this.users[messageFrom].welcome){
                this.users[messageFrom] = {...this.users[messageFrom], welcome: true}
                await send(defaultMessages?.start);
              }else if(!this.users[messageFrom].menuAlredSent){
                this.users[messageFrom] = {...this.users[messageFrom], menuAlredSent: true}
                await send(defaultMessages?.selectNumber);
              }
            }
            break;
        }
      }
    }
  }
}



export const client = new WhatsappService() 