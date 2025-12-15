import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

import {
  // createOpenAIFunctionsAgent,
  AgentExecutor,
  createOpenAIFunctionsAgent,
  createStructuredChatAgent,
  initializeAgentExecutor,
} from "@langchain/classic/agents";
// import { SerpAPIWrapper } from "@langchain/community/tools/serpapi";
import { createInterface } from "readline";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import { AIMessage, HumanMessage } from "langchain";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-1106",
  temperature: 0.7,
});

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a helpful assistant that can access the internet to answer questions.

You have access to the following tools:
{tools}

Tool names:
{tool_names}

Guidelines:
- Use tools ONLY if necessary.
- If the question is simple or can be answered from general knowledge, answer directly.
- If a tool errors, rate limits, or fails, DO NOT retry more than once.
- If the tool fails, clearly say so and answer using your general knowledge.
- Do NOT get stuck retrying tools.

Previous reasoning and observations:
{agent_scratchpad}

When you provide the final response, answer clearly and concisely.`,
  ],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);

const chat_history: any = [];
const tools: any = [
  //   custom
  new GoogleCustomSearch({
    apiKey: process.env.GOOGLE_API_KEY as string,
    googleCSEId: process.env.GOOGLE_CSE_ID as string,
  }),
];

const agent = await createStructuredChatAgent({
  llm: model,
  tools,
  prompt: prompt,
});

// const agent = await createOpenAIFunctionsAgent({ llm: model, tools, prompt });

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = () => {
  rl.question("Human: ", async (input: string) => {
    console.log(input);
    if (input.toLowerCase() == "exit") {
      rl.close();
      return;
    }
    try {
      const response = await agentExecutor.invoke({
        input: input,
        chat_history: chat_history,
        agent_scratchpad: "",
      });
      chat_history.push(new HumanMessage(input));
      chat_history.push(new AIMessage(response.output));

      // console.log(await tools.invoke(input));

      console.log("Agent :", response);
      askQuestion();
    } catch (err) {
      console.error(err);
      rl.close();
    }
  });
};

askQuestion();
