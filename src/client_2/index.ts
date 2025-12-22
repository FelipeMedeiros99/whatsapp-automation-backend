import { create, Whatsapp } from '@wppconnect-team/wppconnect';
import replyMessage from './replyMessage.js';
import path from 'path';
import { fsync, rmSync } from 'fs';
import { clearDb, reactiveBot } from '../client/timeoutFunctions.js';

// Usamos uma função assíncrona para poder usar o 'await'

class WhatsappService2 {
  private client: Whatsapp | null;
  public qrCode: string | null;
  public isLoged: boolean;
  public status: string;
  public sessionName = "greeHotel"
  private statusLog: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.client = null
    this.qrCode = null
    this.isLoged = false
    this.status = "initializing"
    this.initialize()
    clearDb()
    reactiveBot()

    this.statusLog = setInterval(()=>console.log({status: this.status}), 2000)
  }

  async getQrCode(){
    if(this.status === "qrReadError" || this.status === "browserClose"){
      await this.initialize()
      return null
    }

    return this.qrCode
  }

  async initialize() {
    // await this.destroyClient()
    this.status = "starting"

    create({
      session: this.sessionName,
      autoClose: 600000,           // IMPORTANTE: Impede que o bot feche em 60s ou 180s
      disableWelcome: true,   // Evita logs desnecessários de boas-vindas
      tokenStore: 'file',
      waitForLogin: true,     // Faz a biblioteca esperar o login ser concluído
      catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
        this.qrCode = base64Qrimg;
        this.status = "waiting_scan"
      },
      statusFind: (statusSession, session) => {
        this.status = statusSession;
        
        switch(this.status){
          case "isLogged":
            this.isLoged = true;
            this.qrCode = null;
            break
          
          case "inChat":
            this.isLoged = true;
            this.qrCode = null
            clearInterval(this.statusLog!)
            break

          default: 
            this.isLoged = false;
            // this.qrCode = null;
        }
      },
      logQR: false
    })
      .then((client) => {
        this.client = client;
        this.start(client)
      })
      .catch(e => console.log({"erro ocorrido": e}))
  }

  async destroyClient() {
    
    if (this.client) {
      try {
        // Fecha a sessão e o navegador do Puppeteer
        await this.client.close();

        this.client = null;
        this.qrCode = null;
        this.isLoged = false;
      } catch (e) {
        throw e;
      }
    }

    const tokenPath = path.resolve("tokens", this.sessionName);
    if(tokenPath){
      rmSync(tokenPath, {recursive: true, force: true});
    }
    return "Cliente destruído com sucesso.";
  }

  async start(client: Whatsapp | null): Promise<void> {
    if (!client) return

    client.onAnyMessage(async(message) => {
      await replyMessage(message, client)
    });
  }
}

const service2 = new WhatsappService2()

export default service2;