import { ExecutionEnvironment } from "@/types/executor";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAI";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import Groq from "groq-sdk";

export async function ExtractDataWithAIExecutor(
  environment: ExecutionEnvironment<typeof ExtractDataWithAITask>
): Promise<boolean> {
  try {
    const credentials = environment.getInput("Credentials");
    const promt = environment.getInput("Prompt");
    if (!promt) {
      environment.log.error("Input Prompt is required");
      return false;
    }
    const content = environment.getInput("Content");
    if (!content) {
      environment.log.error("Input Content is required");
      return false;
    } // Extract API key from credentials (now properly formatted by credential system)
    let apiKey = process.env.GROQ_API_KEY;
    if (credentials) {
      try {
        // Try to parse as JSON first (for structured API credentials)
        const apiConfig = JSON.parse(credentials);
        apiKey = apiConfig.apiKey || apiConfig.key;
      } catch {
        // If parsing fails, treat credentials as plain API key string
        apiKey = credentials;
      }
    }
    if (!apiKey) {
      environment.log.error("Groq API key is not configured");
      return false;
    }

    const groq = new Groq({ apiKey });

    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            " You are a webscraper helper that extracts data from HTML or text. You will be given a piece of text or HTML content as input and also the prompt with the data you have to extract. The response should always be only the extracted data as a JSON array or object, without any additional words or explanations. Analyze the input carefully and extract data precisely based on the prompt. If no data is found, return an empty JSON array. Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text",
        },
        {
          role: "user",
          content: content,
        },
        {
          role: "user",
          content: promt,
        },
      ],
      temperature: 1,
    });
    environment.log.info(`Promt token ${response.usage?.prompt_tokens}`);
    environment.log.info(
      `Comletion token ${response.usage?.completion_tokens}`
    );
    const result = response.choices[0].message.content;
    if (!result) {
      environment.log.error("Empty response from AI");
      return false;
    }
    environment.setOutput("Extracted data", result);
    return true;
  } catch (e: any) {
    environment.log.error(e.message);
    return false;
  }
}
