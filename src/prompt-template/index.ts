import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Create model object,define model used by openAI and configure.
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 1 });

//Create prompt template for joke
// const prompt = ChatPromptTemplate.fromTemplate(
//   "You are a comedian. Tell me a joke based on the following work ${input}"
// );

//Create prompt template using fromMessage
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "Generate joke on give word "],
  ["human", "${input}"],
]);
//Create Chain
const chain = prompt.pipe(model);

// Call Chain
const response = await chain.invoke({
  input: "salman khan career downfall based on previous movies of bhai jaan",
});

// Console log response give by model
console.log(response);
