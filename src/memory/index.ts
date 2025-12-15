import { ConversationChain } from "@langchain/classic/chains";
import { BufferMemory } from "@langchain/classic/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0.7 });
const prompt = ChatPromptTemplate.fromTemplate(`
    You are an AI assistant.
    History: {history}
    {input}
`);

const bufferMemory = new BufferMemory({ memoryKey: "history" });

//using the chain classes
const chain = new ConversationChain({
  llm: model,
  prompt,
  memory: bufferMemory,
});
//using LCEL

console.log(await bufferMemory.loadMemoryVariables());

// const chain = prompt.pipe(model);
const input1 = {
  input:
    "'I am Batman' say by which actor and list of actor, who is fans favorite batman?",
};
const response1 = await chain.invoke(input1);

console.log(await bufferMemory.loadMemoryVariables());

// const chain = prompt.pipe(model);
const input2 = {
  input: "who is fans favorite superman?",
};
const response2 = await chain.invoke(input2);

console.log(response2);
