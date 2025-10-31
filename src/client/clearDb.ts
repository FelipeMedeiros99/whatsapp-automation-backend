import prisma from "../config/index.js";
import { deleteUser, findAllUser } from "../repository/userCrud.js";

export default function clearDb(){
  
  const oneHour = 60 * 60 // time from whatsapp
  const oneDay = oneHour * 24

  setInterval(async () => {
    try{

      const dbCleanupDays = await prisma.restrictions.findUnique({where: {title: "dbCleanupDays"}})
      let qtDays = dbCleanupDays?.restrictionNumber || 30;
      const currentTime = Date.now()/1000;
      const comparationTime = currentTime - qtDays * oneDay

      
      await prisma.user.deleteMany({
        where: {
          timestamp: {
            lt: comparationTime
          }
        }
      })
    }catch(e){
      console.error("Erro ao limpar banco: ", e)
    }
  }, oneDay/2)
}