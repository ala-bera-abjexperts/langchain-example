import {} from "langchain";
import { createStuffDocumentsChain } from "@langchain/classic/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0.7 });
//Documents
// const documentA = new Document({
//   pageContent:
//     "ABJ Experts is a Software Development Company situated in India that is skilled and proven in software development, Mobile application development, Web applications, React Native, ReactJS, Java, Python Open source, PHP, NodeJs, DevOps, and many other IT outsourcing services. ABJ Experts has expertise in building and maintaining high-quality solutions for Client-Server Technology, Software Development, and Web Applications development. We have vast experience in platforms like Android, PHP, WordPress, Shopify, Angular JS, Magneto, and many more. ABJ Experts offers Software Development and Solutions in various industries such as Automotive Jobs, Real Estate, Hospitality, Dental, Banking / Finance, Media and Entertainment, and many more. The team at ABJ Experts has decades of combined experience and a seasoned team of technology professionals whose single purpose is to develop the right solution for your Business. We are here with an extensive variety of services and solutions which include software development, cloud service, mobile apps development, web development, and digital marketing. Custom Web Application Development Custom Mobile Application Development Custom Software Development Web Application",
// });
const prompt = ChatPromptTemplate.fromTemplate(
  `Answer the user question.  
  Context: {context}
  Question: {input}
`
);

const loader = new CheerioWebBaseLoader("https://abjexperts.com");
const docs = await loader.load();
console.log(docs);
// const chain = prompt.pipe(model);
const chain = await createStuffDocumentsChain({
  llm: model,
  prompt,
});
const response = await chain.invoke({
  input:
    "List Developer of ABJ Experts and Co-founder and Founder of ABJ Experts ?",
  context: docs,
});

console.log(response);
