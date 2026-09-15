import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import "dotenv/config";
import prisma from "../config/index.js"; // Seu Prisma Client

// Inicialização dos provedores
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Função auxiliar para formatar a data atual e fornecer contexto temporal dinâmico
function getContextDateInfo(): string {
  const today = new Date();
  return today.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const format = (response: string) => {
  const rawText = response.trim() || "0";
  const ids = rawText
    .split(",")
    .map((str) => parseInt(str.trim(), 10))
    .filter((num) => !isNaN(num) && num > 0);
  return ids;
};

/**
 * ESTÁGIO 1: O Roteador (Extractor)
 * Função responsável exclusivamente por analisar a conversa e extrair os IDs dos tópicos necessários.
 */
async function extractRelevantRuleIds(
  userMessage: string,
  availableRules: { id: number; title: string; description: string | null }[],
): Promise<number[]> {
  // Construção do catálogo (apenas título e descrição, sem o texto completo da regra para economizar tokens e evitar confusão)
  const catalogList = availableRules
    .map((r) => `[ID: ${r.id}] ${r.title} - ${r.description}`)
    .join("\n");

  const routerPrompt = `
Você é um classificador de intenção de atendimento de hotel.
Sua única função é ler as últimas mensagens do usuário e identificar quais tópicos da nossa base de conhecimento contêm as informações necessárias para que outro assistente formule uma resposta completa.

# CATÁLOGO DE TÓPICOS DISPONÍVEIS (Base de Conhecimento)
${catalogList}

# INSTRUÇÕES CRÍTICAS
1. Analise a conversa abaixo.
2. Identifique quais tópicos do catálogo são necessários para responder à última mensagem ou intenção principal.
3. Se a intenção for clara, escolha apenas os tópicos relevantes.
4. Você deve retornar UNICA E EXCLUSIVAMENTE uma lista de IDs numéricos separados por vírgula. 
5. NÃO ADICIONE NENHUM TEXTO, EXPLICAÇÃO OU FORMATAÇÃO (sem aspas, sem colchetes, sem markdown). Apenas os números. (Exemplo de resposta esperada: 1, 4, 7).
6. Se o usuário estiver apenas saudando (ex: "Oi", "Bom dia") ou agradecendo, e não demandar nenhuma regra específica, retorne apenas o número 0.

# MENSAGENS DA CONVERSA
${userMessage}
`;
  try {
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: routerPrompt,
        // Forçamos a IA a não ser criativa neste passo de classificação
        config: { temperature: 0.3 },
      });

      const ids = format(response?.text || "");
      return ids;
    } catch (e) {
      console.warn("Fallback para DeepSeek acionado na etapa de Geração...");
      const response = await deepseek.chat.completions.create({
        messages: [{ role: "system", content: routerPrompt }],
        model: "deepseek-chat",
        temperature: 0.3,
      });

      return format(response.choices[0].message.content || "");
    }
  } catch (e) {
    console.error("Erro crítico na extração de IDs relevantes:", e);
    return []; // Fallback gracioso: Nenhum tópico relevante encontrado
  }
}

/**
 * ESTÁGIO 2: O Gerador (Responder)
 * Orquestra todo o fluxo, une os dados e gera a resposta final para o WhatsApp.
 */
export default async function iaResponse(userMessage: string = "") {
  try {
    // 1. Busca diretrizes fixas essenciais e o catálogo de regras (somos rápidos aqui porque pegamos apenas os metadados das regras)
    const [transferPhraseData, allRulesMetas] = await Promise.all([
      prisma.restrictions.findUnique({ where: { title: "transferPhrase" } }),
      prisma.botRules.findMany({
        select: { id: true, title: true, description: true },
      }), // Otimização: Não traz a coluna `rule` (texto completo) ainda
    ]);

    // O Estilo de Resposta Global deve SEMPRE estar presente. Assumimos que o ID 1 (ou pelo título) seja o estilo global.
    // DICA: O ideal é ter a diretriz de estilo fixa no mainPrompt, mas se ela estiver no BotRules, nós a garantimos aqui.
    let rulesTextToInject = "";

    // 2. Aciona o Roteador para extrair IDs relevantes (Passo 1 do RAG)
    const selectedIds = await extractRelevantRuleIds(
      userMessage,
      allRulesMetas,
    );

    console.log(
      `[RAG Router] IDs selecionados para contexto: ${selectedIds.length > 0 ? selectedIds.join(", ") : "Nenhum (Conversa genérica)"}`,
    );

    // 3. Busca no banco o texto completo (coluna `rule`) Apenas dos tópicos selecionados
    if (selectedIds.length > 0) {
      if (!selectedIds.includes(1)) selectedIds.push(1); // Garantindo que o Estilo Global (ID 1) esteja sempre presente
      const selectedRules = await prisma.botRules.findMany({
        where: { id: { in: selectedIds } },
      });
      rulesTextToInject = selectedRules
        .map((r) => `[${r.title}]\n${r.rule}`)
        .join("\n\n");
    } else {
      console.log(
        "Nenhum tópico relevante encontrado. Conversa genérica de saudação ou encerramento.",
      );
      const allRules = await prisma.botRules.findMany({ where: { id: 1 } }); // Supondo que o ID 1 seja o estilo global
      rulesTextToInject = allRules
        .map((r) => `[${r.title}]\n${r.rule}`)
        .join("\n\n");
    }

    console.log({ userMessage, rulesTextToInject });

    // 4. Montagem do Contexto Final para Geração
    const finalContent = `
# DIRETRIZ CRÍTICA DE TRANSFERÊNCIA
Se for necessário acionar um humano, use a exata frase: ${transferPhraseData?.restriction || "Irei repassar você para um atendente"}

# INFORMAÇÃO TEMPORAL
Use a data atual para cálculo de datas: ${getContextDateInfo()}

# CONHECIMENTO ESPECÍFICO RECUPERADO PARA ESTE ATENDIMENTO
As informações abaixo contêm as políticas e tarifas corretas aplicáveis à dúvida do cliente.
Se o conhecimento abaixo estiver vazio, significa que é uma conversa genérica de saudação ou encerramento, e você deve apenas responder polidamente de acordo com o contexto.
--- INÍCIO DA BASE DE CONHECIMENTO ---
${rulesTextToInject}
--- FIM DA BASE DE CONHECIMENTO ---

# HISTÓRICO DE MENSAGENS DA CONVERSA
* from: me (Mensagens enviadas pelo hotel/você)
* from: client (Mensagens do cliente)
* from: bot (Mensagens de fluxos anteriores do assistente)
A ordem das mensagens é da mais antiga para a mais nova. Foque sua resposta na última mensagem do cliente.
${userMessage}
`;

    // 5. Geração da Resposta Final (Com fallback)
    try {
      const response = await gemini.models.generateContent({
        model: "gemini-3.5-flash",
        contents: finalContent,
        config: { temperature: 0.5 }, // Levemente criativo para a conversa, mas aderente aos fatos
      });

      return response.text;
    } catch (e) {
      console.warn("Fallback para DeepSeek acionado na etapa de Geração...");
      const response = await deepseek.chat.completions.create({
        messages: [{ role: "system", content: finalContent }],
        model: "deepseek-chat",
        temperature: 0.5,
      });

      return response.choices[0].message.content;
    }
  } catch (e) {
    console.error("Erro crítico na orquestração da resposta da IA:", e);
    return "No momento estou passando por uma instabilidade técnica. Irei repassar você para um atendente."; // Fallback gracioso para WhatsApp
  }
}
