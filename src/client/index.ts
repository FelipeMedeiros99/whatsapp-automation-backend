import { Client, Message } from 'whatsapp-web.js';
import { info, localization, menuMessage, reservation, startMessage, tariffs } from './const';


interface Users{
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
  private users:Users = {};

  constructor() {
    this.client = new Client({});
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
      const contentMessage = message.body.toLowerCase().trim();
      if (!message.id.fromMe && message.from.includes("@c.us")) {
        if (!this.users[message.from] as boolean) {
          this.users[message.from] = ({ timestamp: message.timestamp, isBotStoped: false })
        }
        if (!this.users[message.from].isBotStoped) {
          if (contentMessage === "1") {
            await this.client.sendMessage(message.from, tariffs);
            await this.client.sendMessage(message.from, menuMessage);
          } else if (contentMessage === "2") {
            await this.client.sendMessage(message.from, info);
            await this.client.sendMessage(message.from, menuMessage);
          } else if (contentMessage === "3") {
            await this.client.sendMessage(message.from, reservation);
            this.users[message.from] = ({ ...this.users[message.from], isBotStoped: true })
          } else if (contentMessage === "4") {
            await this.client.sendMessage(message.from, localization);
            await this.client.sendMessage(message.from, menuMessage);
          } else if (contentMessage === "5") {
            await this.client.sendMessage(message.from, "Aguarde, em breve você será atendido!");
            this.users[message.from] = ({ ...this.users[message.from], isBotStoped: true })
          } else {
            await this.client.sendMessage(message.from, startMessage)
          }
        }
      }
    })

    setInterval(() => {
      for (let key of Object.keys(this.users)) {
        if (Math.ceil(Date.now() / 1000) - this.users[key].timestamp > 60 * 60) {
          delete this.users[key]
        }
      }
    }, 60 * 60)
  }

  async connect(): Promise<string> {
    if (!this.client.info) {
      await this.client.initialize();
    }

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
      this.setupListeners();
    }
  }

  public getStatus() {
    return { isLoged: this.isAuthenticated };
  }

  public getMessages() {
    return this.messages;
  }
}



export const client = new WhatsappService()