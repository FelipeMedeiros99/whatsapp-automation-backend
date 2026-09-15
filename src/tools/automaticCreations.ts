import { DefaultMessages } from "@prisma/client";
import prisma from "../config/index.js";
import { defaultMessages } from "../client/const.js";
import * as rules from "./defaultRules.js";

export async function createRestrictionsDefault() {
  const initialBotRules = [
    {
      title: "Estilo de resposta e tom de voz",
      description:
        "DIRETRIZ GLOBAL: Utilize em TODAS as respostas. Define sua persona (Gree Assistente), tom formal/agradável, uso de negrito/itálico e a proibição estrita de inventar dados.",
      rule: rules.IA_STYLE,
    },
    {
      title: "Tarifários",
      description:
        "Utilize quando o cliente perguntar sobre 'preços', 'valores', 'quanto custa a diária' ou 'orçamento' para dias comuns. NÃO utilize se o cliente mencionar o evento Santos Eagle Team.",
      rule: rules.VALUES,
    },
    {
      title: "Datas Sem Disponibilidade (Sold Out)",
      description:
        "GATILHO DE LOTAÇÃO: Utilize SEMPRE que o cliente informar uma data específica para reserva ou perguntar se 'tem vaga', 'quarto disponível', 'tem disponibilidade' ou 'está lotado'. Contém a lista exata de dias em que o hotel NÃO tem mais quartos.",
      rule: rules.UNAVAILABLE_DATES, // Crie esta nova constante (veja abaixo)
    },
    {
      title: "Serviços Inclusos",
      description:
        "Utilize para responder dúvidas sobre o que tem no hotel, cortesias, café da manhã, internet (Wi-Fi), uso da piscina e disponibilidade de garagem/estacionamento.",
      rule: rules.SERVICES_INCLUDED,
    },
    {
      title: "Políticas Importantes",
      description:
        "Utilize para responder sobre horários exatos de entrada (check-in) e saída (check-out), se criança paga, se aceita animais (pets/cachorro), se pode fumar e o momento da cobrança.",
      rule: rules.IMPORTANT_POLICIES,
    },
    {
      title: "Promoções e Descontos",
      description:
        "Utilize APENAS quando o cliente perguntar sobre 'descontos', 'promoção' ou vantagens ao pagar com dinheiro em espécie (notas).",
      rule: rules.PROMOTIONS,
    },
    {
      title: "Contato e Localização",
      description:
        "Utilize quando o cliente pedir a 'localização', 'endereço', 'onde fica', 'Google Maps', site oficial ou e-mail para reservas corporativas (empresas).",
      rule: rules.CONTACT_AND_LOCATION,
    },
    {
      title: "Formas de Pagamento",
      description:
        "Utilize quando o cliente perguntar 'como posso pagar', 'aceita cartão', 'aceita Pix', ou perguntar sobre opções de parcelamento. NÃO confunda com a regra de 'momento do pagamento'.",
      rule: rules.PAYMENT_METHODS,
    },
    {
      title: "Gatilhos de Transferência",
      description:
        "CRÍTICO: Verifique este bloco antes de responder. Utilize para saber quando você DEVE parar de falar e transferir para um humano (ex: envio de CPF/CNPJ, perguntas de disponibilidade, pedir atendente).",
      rule: rules.TRANSFER_RULES,
    },
    {
      title: "Fluxo de Reserva",
      description:
        "Utilize quando o cliente estiver em processo de fechamento, dizendo 'quero reservar', 'vamos fechar'. Contém os passos lógicos de quais dados solicitar (Nome, CPF, datas) na ordem certa.",
      rule: rules.BOOKING_FLOW,
    },
    {
      title: "Procedimentos Diversos",
      description:
        "Utilize para regras operacionais complexas: como emitir Nota Fiscal (NF/CNPJ), chegar de madrugada, sair muito tarde (Late check-out), chegar muito cedo (Early check-in) e reservas de Réveillon.",
      rule: rules.SPECIFIC_PROCEDURES,
    },
  ];

  const defaultRestrictions = [
    {
      title: "historyLimit",
      restriction: null,
      restrictionNumber: 4,
    },
    {
      title: "transferPhrase",
      restriction: "Irei repassar você para um atendente",
      restrictionNumber: null,
    },
    {
      title: "dbCleanupDays",
      restriction: null,
      restrictionNumber: 30,
    },
    {
      title: "responseDelay",
      restriction: null,
      restrictionNumber: 3.5,
    },
  ];

  const defaultFinishMessage: Omit<DefaultMessages, "id">[] = [
    {
      text: `🏨 *Informativos do Gree Hotel* 🏨

- Café da manhã incluso
- Garagem rotativa *(vagas limitadas)*
- Crianças até 3 anos não pagam
- Wi-Fi gratuito
- Piscina disponível das 6h às 18h
- Quartos triplos e quádruplos com 2 camas de casal
- Não aceitamos pets

🕒 *Check-In*: A partir das 14h
🕛 *Check-Out*: Até às 12h

🌐 Site oficial: www.greehotel.com.br
📩 Reservas corporativas: reservasgree@gmail.com`,
      key: "FINISH_RESERV",
    },

    {
      text: `Desconto de R$ 20,00 em cada diária para pagamento com dinheiro em espécie.`,
      key: "FINISH_RESERV",
    },

    {
      text: `Podemos ajudar em algo mais?`,
      key: "FINISH_RESERV",
    },
  ];

  try {
    await Promise.all(
      defaultRestrictions.map(async (defaultConfig) => {
        console.log("inserindo restriçções no banco...");
        await prisma.restrictions.upsert({
          where: {
            title: defaultConfig.title,
          },
          update: {},
          create: defaultConfig,
        });
        console.log("restrições inseridas");
      }),
    );

    console.log("Inserindo as regras do hotel no banco sequencialmente...");
    for (const rule of initialBotRules) {
      await prisma.botRules.upsert({
        where: {
          title: rule.title,
        },
        update: {},
        create: rule,
      });
      console.log(`Regra criada/verificada: ${rule.title}`);
    }
    console.log("Todas as regras foram inseridas com sucesso.");

    console.log("Inserindo mensagens de confirmação de reserva padrão");
    const messages = await prisma.defaultMessages.findMany();
    if (messages.length === 0) {
      await prisma.defaultMessages.createMany({
        data: defaultFinishMessage,
      });
    }
    console.log("mensagens padrão inseridas");
  } catch (error) {
    console.error("Erro ao verificar/criar restrição padrão:", error);
  }
}
