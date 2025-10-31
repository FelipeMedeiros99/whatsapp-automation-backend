import prisma from "../config/index.js";

const oneHour = 60 * 60 // time from whatsapp
const oneDay = oneHour * 24

export function clearDb(){
  setInterval(async () => {
    try{

      const dbCleanupDays = await prisma.restrictions.findUnique({where: {title: "dbCleanupDays"}})
      let qtDays = dbCleanupDays?.restrictionNumber || 30;
      const currentTime = Math.floor(Date.now()/1000);
      const comparationTime = currentTime - qtDays * oneDay
      
      await prisma.user.deleteMany({
        where: {
          timestamp: {
            lt: BigInt(comparationTime)
          }
        }
      })
    }catch(e){
      console.error("Erro ao limpar banco: ", e)
    }
  }, 1000 * 60 * 60 / 2)
}


export function reactiveBot(){
      setInterval(async () => {
        const currentDateInSeconds = Math.floor(Date.now()/1000);
        const defaultTime = oneHour * 2

        await prisma.user.updateMany({
          where: {
            timestamp: {
              lt: BigInt(currentDateInSeconds - defaultTime)
            }
          },
          data: {
            isBotStoped: false
          }
        })
    }, 1000 * 60 * 30)
}