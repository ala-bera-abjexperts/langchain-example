import {} from "langchain";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/classic/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { createRetrievalChain } from "@langchain/classic/chains/retrieval";

const CreateVectorStore = async () => {
  // Load Data from web page
  const loader = new CheerioWebBaseLoader("https://abjexperts.com/");
  const docs = await loader.load();
  // const chain = prompt.pipe(model);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 20,
  });
  const splitDocs = await splitter.splitDocuments(docs);
  const embedding = new OpenAIEmbeddings();
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embedding
  );
  return vectorStore;
};

const CreateChain = async (vectorStore: any) => {
  const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 1 });
  //Documents
  // const documentA = new Document({
  //   pageContent:
  //     "ABJ Experts is a Software Development Company situated in India that is skilled and proven in software development, Mobile application development, Web applications, React Native, ReactJS, Java, Python Open source, PHP, NodeJs, DevOps, and many other IT outsourcing services. ABJ Experts has expertise in building and maintaining high-quality solutions for Client-Server Technology, Software Development, and Web Applications development. We have vast experience in platforms like Android, PHP, WordPress, Shopify, Angular JS, Magneto, and many more. ABJ Experts offers Software Development and Solutions in various industries such as Automotive Jobs, Real Estate, Hospitality, Dental, Banking / Finance, Media and Entertainment, and many more. The team at ABJ Experts has decades of combined experience and a seasoned team of technology professionals whose single purpose is to develop the right solution for your Business. We are here with an extensive variety of services and solutions which include software development, cloud service, mobile apps development, web development, and digital marketing. Custom Web Application Development Custom Mobile Application Development Custom Software Development Web Application",
  // });
  const prompt = ChatPromptTemplate.fromTemplate(
    `Answer the user's question.  
    Context: {context}
    Question: {input}
  `
  );
  const chain = await createStuffDocumentsChain({
    llm: model,
    prompt,
  });
  const retriever = vectorStore.asRetriever({
    k: 100,
  });

  const conversationChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever: retriever,
  });
  return conversationChain;
};

const vectorMemory = await CreateVectorStore();
const retrievedChain = await CreateChain(vectorMemory);
const response = await retrievedChain.invoke({
  input: "List Down member of ABJ experts with role and name?",
  // docs,
});

console.log(response);
