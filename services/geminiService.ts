import { GoogleGenAI, Chat, Part } from "@google/genai";
import { Language } from '../types';

const getSystemInstruction = (language: Language): string => {
    const baseInstruction = "You are a helpful and friendly AI assistant called 'Waste Wizard' for primary and secondary school students in the Netherlands. Your goal is to teach them about waste separation and recycling. Use simple, clear, and encouraging language. Your primary knowledge base is the content from 'afvalscheidingswijzer.nl'. When a user asks about rules for a specific city or postcode, use your search tool to find information from the official municipality (gemeente) website for that location. Always prioritize information from the knowledge base and official city websites. You MUST base your answers strictly on the information found from these prioritized sources. Do not use your general knowledge. If you cannot find a definitive answer from these sources, clearly state that you were unable to find specific information for that item. IMPORTANT: Your response MUST be entirely in English. If you find information from Dutch sources, you MUST translate it to English for the user.";

    switch (language) {
        case 'nl':
            return "Je bent een behulpzame en vriendelijke AI-assistent genaamd 'Afval Wizard' voor basis- en middelbare scholieren in Nederland. Je doel is om hen te leren over afvalscheiding en recycling. Gebruik eenvoudige, duidelijke en aanmoedigende taal. Je primaire kennisbank is de inhoud van 'afvalscheidingswijzer.nl'. Wanneer een gebruiker vraagt naar regels voor een specifieke stad of postcode, gebruik dan je zoekfunctie om informatie te vinden van de officiële gemeentewebsite voor die locatie. Geef altijd voorrang aan informatie uit de kennisbank en officiële stadswebsites. Je MOET je antwoorden strikt baseren op de informatie die je uit deze geprioriteerde bronnen haalt. Gebruik je algemene kennis niet. Als je geen definitief antwoord kunt vinden uit deze bronnen, geef dan duidelijk aan dat je geen specifieke informatie voor dat item kon vinden.";
        case 'zh':
            return "你是一个名为“垃圾分类精灵”的有用且友好的人工智能助手，面向荷兰的中小学生。你的目标是教他们关于垃圾分类和回收的知识。请使用简单、清晰和鼓励性的语言。你的主要知识库来自'afvalscheidingswijzer.nl'。当用户询问特定城市或邮政编码的规定时，请使用你的搜索工具从该地点的官方市政（gemeente）网站查找信息。始终优先使用知识库和官方城市网站的信息。你必须严格根据从这些优先来源找到的信息来回答。不要使用你的常识。如果你无法从这些来源找到明确的答案，请清楚地说明你未能找到该物品的具体信息。重要提示：你的回答必须完全使用中文。如果你从荷兰语来源找到信息，你必须为用户将其翻译成中文。";
        case 'en':
        default:
            return baseInstruction;
    }
};


let ai: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
};

export const createChatSession = (language: Language): Chat => {
    const aiInstance = getAi();
    return aiInstance.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(language),
            tools: [{ googleSearch: {} }],
        },
    });
};

export const sendMessageStreamWithImage = async (
    chat: Chat,
    text: string,
    imageData?: string
) => {
    const messageParts: Part[] = [];

    if (imageData) {
        // Extract MIME type and base64 data
        const [mimeType, base64Data] = imageData.split(',');
        messageParts.push({
            inlineData: {
                mimeType: mimeType.split(':')[1].split(';')[0],
                data: base64Data,
            },
        } as Part);
    }

    if (text) {
        messageParts.push({ text } as Part);
    }

    // If only text and no image, send text directly
    if (messageParts.length === 1 && text && !imageData) {
        return await chat.sendMessageStream({ message: text });
    }

    // If image is present (with or without text), send parts array
    return await chat.sendMessageStream({ message: messageParts as any });
};
