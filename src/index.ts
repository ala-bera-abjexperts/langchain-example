import type { MessageStructure } from "@langchain/core/messages";
import type { IterableReadableStream } from "@langchain/core/utils/stream";
import { ChatOpenAI } from "@langchain/openai";
import type { AIMessageChunk } from "langchain";

const openapi_key = process.env.OPENAI_API_KEY;

console.log("Key :", openapi_key);

if (!openapi_key) {
  console.error("Open API key is required!");
} else {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
    maxTokens: 1000,
    verbose: true,
    // apiKey: openapi_key
  });
  const response = await model.invoke(
    "disadvantage of using chatgpt and AI for developer"
  );

  console.log("response :", response);

  // for await (let i of response) {
  //   console.log(i);
  // }
}
