import OpenAI from "openai";

let client: OpenAI | null = null;

export const openAIModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return client;
}
