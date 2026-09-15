// import { Client, Message } from "whatsapp-web.js";
import { createUser, updateUser } from "../repository/userCrud.js";
import { defaultMessages } from "./const.js";
import { sleep } from "../tools/timeFunctions.js";
import { createMessage, findMessage } from "../repository/message.js";
import iaResponse from "../iaResponse/iaResponse.js";
import prisma from "../config/index.js";
import { Message, Whatsapp } from "@wppconnect-team/wppconnect";
import { getRestrictionByTitle } from "../repository/geminiCrud.js";
import { Restrictions } from "@prisma/client";

// const gree = "559891402255"
// const felipe = "559887835523"
// const leo = "559884786375"
// const vivi = "559899066813"

export default async function replyMessage(message: Message, client: Whatsapp) {
  // CONSTS
  // const createUser = async () => {};

  const isMe = message.sender.isMe;
  const contentMessage = message.body || "";
  const messageTo = message.to;
  const messageFrom = message.from;

  // FUNCTIONS
  const sendMessage = async (text: string, number: string = messageFrom) => {
    try {
      await client.sendText(number, text);
    } catch (e) {
      console.log("erro ao enviar mensagem: ", e);
    }
  };

  const validIfResponseHasTransferPhrase = (
    transferPhraseModel: Restrictions | null,
    contentMessage: string,
  ) => {
    const transferPhrase =
      transferPhraseModel?.restriction?.toLocaleLowerCase() || "";
    const formatedMessage = contentMessage?.toLocaleLowerCase();
    const isTransferPhrase =
      transferPhrase && formatedMessage?.includes(transferPhrase);
    return isTransferPhrase;
  };

  console.log({ isMe, contentMessage, messageTo, messageFrom });

  if (isMe) {
    const clientChatId = messageTo;
    const transferPhrase = await getRestrictionByTitle("transferPhrase");

    let userData = await createUser({
      number: clientChatId,
      name: null,
      wasWelcome: true,
      timestamp: BigInt(message.t),
      isBotStoped: false,
      lastMessageFromBot: false,
      timeoutId: null,
    });
    if (!userData) return;

    const hasTransferPhrase = validIfResponseHasTransferPhrase(
      transferPhrase,
      contentMessage,
    );

    if (hasTransferPhrase) {
      const updateuserPromise = updateUser(clientChatId, {
        isBotStoped: true,
        lastMessageFromBot: false,
      });

      const createMessagePromise = createMessage({
        userNumber: clientChatId,
        text: contentMessage,
        from: "bot",
      });
      await Promise.all([updateuserPromise, createMessagePromise]);
      return;
    }

    if (userData?.lastMessageFromBot) {
      const updateuserPromise = updateUser(clientChatId, {
        lastMessageFromBot: false,
      });
      const createMessagePromise = createMessage({
        userNumber: clientChatId,
        text: contentMessage,
        from: "bot",
      });
      await Promise.all([updateuserPromise, createMessagePromise]);
      return;
    }

    if (contentMessage === defaultMessages.reserved) {
      const finishMessages = await prisma.defaultMessages.findMany({
        where: {
          key: "FINISH_RESERV",
        },
      });
      for (let message of finishMessages) {
        await sleep(2000);
        await sendMessage(message.text, clientChatId);
      }
      return;
    }

    if (contentMessage === defaultMessages.finish && userData.isBotStoped) {
      await updateUser(clientChatId, { isBotStoped: false });
      return;
    }

    if (!userData.isBotStoped) {
      await updateUser(clientChatId, { isBotStoped: true });
      console.log(`Bot PAUSADO para o chat: ${clientChatId}`);
    }
    await createMessage({
      userNumber: clientChatId,
      text: contentMessage,
      from: "me",
    });
    return;
  }

  if (
    !isMe &&
    (messageFrom.includes("@c.us") || messageFrom.includes("@lid")) &&
    contentMessage
  ) {
    const restrictionDelayPromise = prisma.restrictions.findUnique({
      where: { title: "responseDelay" },
    });
    const transferPhrasePromise = prisma.restrictions.findUnique({
      where: { title: "transferPhrase" },
    });

    const clientChatId = messageFrom;
    const userData = await createUser({
      number: clientChatId,
      name: message.sender.name
        ? message.sender.name
        : message.sender.pushname || "",
      wasWelcome: true,
      timestamp: BigInt(message.t),
      isBotStoped: false,
      lastMessageFromBot: false,
      timeoutId: null,
    });

    await createMessage({
      userNumber: clientChatId,
      from: "client",
      text: contentMessage,
    });

    if (!userData) return;
    const { isBotStoped, timeoutId, wasWelcome } = userData;

    if (!isBotStoped) {
      if (timeoutId) clearTimeout(timeoutId);

      const restrictionDelay = await restrictionDelayPromise;
      let delay = Number(restrictionDelay?.restrictionNumber) * 1000 || 3500;

      const userTimeout = setTimeout(async () => {
        try {
          const messagesDataPromise = findMessage(clientChatId);
          const deleteTimeoutIdPromise = updateUser(clientChatId, {
            timeoutId: null,
          });
          const [messagesData] = await Promise.all([
            messagesDataPromise,
            deleteTimeoutIdPromise,
          ]);

          if (!messagesData) return;

          const messageContext = messagesData
            ?.map(
              (msg: { date: Date; from: string; text: string }) =>
                `${msg.from} (${msg.date}): ${msg.text}`,
            )
            .join("\n");
          const iaResponsePromise = iaResponse(messageContext) || "";

          if (messagesData[messagesData.length - 1]?.from === "client") {
            const responseFromIa = (await iaResponsePromise) || "";
            const sendingMessage = sendMessage(responseFromIa);
            const transferPhrase = await transferPhrasePromise;

            if (
              responseFromIa
                .toLocaleLowerCase()
                .includes(
                  transferPhrase?.restriction ||
                    "irei repassar você para um atendente",
                )
            ) {
              const updateuserPromise = updateUser(clientChatId, {
                isBotStoped: true,
                lastMessageFromBot: true,
              });
              await Promise.all([updateuserPromise, sendingMessage]);
              return;
            }
            const updatingUser = updateUser(clientChatId, {
              isBotStoped: false,
              lastMessageFromBot: true,
              wasWelcome: false,
            });
            await Promise.all([sendingMessage, updatingUser]);
          }
        } catch (e) {
          console.log("erro ao enviar mensagem: ", e);
        }
      }, delay);

      await updateUser(clientChatId, { timeoutId: Number(userTimeout) });
    }
  }
}
