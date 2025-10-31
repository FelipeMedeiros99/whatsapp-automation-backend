import prisma from "../config/index.js";
import { deleteUser, findAllUser } from "../repository/userCrud.js";

export default function clearDb(){
  
  const oneHour = 60 * 60 * 1000
  const oneDay = oneHour * 24

  setInterval(async () => {
    const dbCleanupDaysPromise = prisma.restrictions.findUnique({where: {title: "dbCleanupDays"}})
    const usersPromise = findAllUser();

    const [dbCleanupDays, users] = await Promise.all([dbCleanupDaysPromise, usersPromise]);

    let qtDays = 30;
    if(dbCleanupDays?.restrictionNumber) qtDays = dbCleanupDays.restrictionNumber;
    if (!users) return;

    for (let user of users) {
      if (Date.now() - Number(user.timestamp) * 1000 > oneDay * qtDays) {
        await deleteUser(user.number)
      }
    }
  }, oneDay/2)
}