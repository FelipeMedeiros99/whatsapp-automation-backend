import { create, Whatsapp } from '@wppconnect-team/wppconnect';

// Usamos uma função assíncrona para poder usar o 'await'

class WhatsappService2 {
  private client: Whatsapp | null;
  public qrCode: string | null;
  public isLogged: boolean;

  constructor() {
    this.client = null
    this.qrCode = null
    this.isLogged = false
  }

  async initialize() {
    try {
      this.client = await create({
        session: "greeHotel",
        catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
          this.qrCode = asciiQR;
        },
        statusFind: (statusSession, session) => {
          if(statusSession = "isLogged"){
            this.isLogged = true
          }else{
            this.isLogged = false
          }
        }
      })

      console.log("Connected!")
      this.start()

    } catch (e) {
      console.log("Error while try connect: ", e)
    }
  }

  start() {
    if (!this.client) return;

    this.client.onMessage((message) => {
      console.log('Mensagem recebida:', message.body);
    });
  }
}

const service2 = new WhatsappService2()

export default service2;