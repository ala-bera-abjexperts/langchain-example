import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createHistoryAwareRetriever } from "@langchain/classic/chains/history_aware_retriever";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});
const loader = new CheerioWebBaseLoader("https://abjexperts.com/");
const docs = await loader.load();
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
});
const splitDocs = await splitter.splitDocuments(docs);
const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
);

const retriever = vectorStore.asRetriever({
  k: 2,
});

const retrieverPrompt = ChatPromptTemplate.fromTemplate(`
Generate only a short search query string based on the conversation.
Do NOT include explanations, formatting, or additional text.
Output ONLY the search query text.

Chat history:
{chat_history}

User: {input}
`);
const historyAwareRetrived = await createHistoryAwareRetriever({
  llm: model,
  retriever: retriever,
  rephrasePrompt: retrieverPrompt,
});

const input = "Tell me about ABJ Experts and what is my name?";

//Chat History
const chatHistory = [
  new HumanMessage("Hi"),
  new AIMessage("Hi, How are you"),
  new HumanMessage("Fine !"),
  new AIMessage("What is your name?"),
  new HumanMessage("My Name is Jalish Chauhan"),
  new AIMessage("Jalish, How can i help you?"),
  new HumanMessage("I need Information related to ABJ Experts"),
];
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Answer user question based on the following context :{context}."],
  new MessagesPlaceholder("chat_history"),
  ["human", "{input}"],
]);
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});
const conversationChain = await createRetrievalChain({
  combineDocsChain: chain,
  retriever: historyAwareRetrived,
});

const response = await conversationChain.invoke(
  {
    input: input,
    chat_history: chatHistory,
    // docs,
  },
  {}
);

console.log(response);

// const QUESTION_GEN_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

// Chat History:
// {chat_history}
// Follow Up Input: {input}
// Standalone question:`;

// // --- Prompt for LLM ---
// const questionGenPrompt = ChatPromptTemplate.fromTemplate(
//   QUESTION_GEN_TEMPLATE
// );

// // --- Load documents using CheerioWebBaseLoader ---
// const loader = new CheerioWebBaseLoader("https://abjexperts.com");

// // Loads an array of Document objects: [{ pageContent, metadata }, ...]
// const docs = await loader.load();

// // --- Create vectorstore from the loaded documents ---
// const vectorstore = await MemoryVectorStore.fromDocuments(
//   docs,
//   new OpenAIEmbeddings()
// );

// const retriever = vectorstore.asRetriever({ k: 2 });

// const llm = new ChatOpenAI({
//   model: "gpt-3.5-turbo",
//   temperature: 0.7,
// });

// const chain = await createHistoryAwareRetriever({
//   llm,
//   retriever,
//   rephrasePrompt: questionGenPrompt,
// });

// // --- Normal behavior continues ---
// const outputDocs = await chain.invoke({
//   input: "What is the powerhouse of the cell?",
//   chat_history: "",
// });

// console.log(outputDocs);

// const outputDocs2 = await chain.invoke({
//   input: "Tell me about ABJ Experts,teams and what is my name?",
//   chat_history: chatHistory.join("\n"),
// });

// console.log(outputDocs2);
