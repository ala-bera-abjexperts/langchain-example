import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  CommaSeparatedListOutputParser,
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import * as z from "zod";

// Create model object,define model used by openAI and configure.
const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 1 });

//Create prompt template for joke
// const prompt = ChatPromptTemplate.fromTemplate(
//   "You are a comedian. Tell me a joke based on the following work ${input}"
// );

//Create prompt template using fromMessage

async function callStringOutputParser() {
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "Generate joke on give word "],
    ["human", "${input}"],
  ]);
  const parser = new StringOutputParser();

  //Create Chain
  const chain = prompt.pipe(model).pipe(parser);

  // Call Chain
  return await chain.invoke({
    input: "salman khan career downfall based on previous movies of bhai jaan",
  });
}

async function callListOutputParser() {
  const prompt = ChatPromptTemplate.fromTemplate(
    "Provide top good 5 list of movies release in this 2021 year , seperate by commas, for the following word ${word}"
  );
  const outparser = new CommaSeparatedListOutputParser();
  const chain = prompt.pipe(model).pipe(outparser);
  return await chain.invoke({ word: "india movies" });
}

//structure output parser
async function callStructureParse() {
  const prompt = ChatPromptTemplate.fromTemplate(`
    Extract information from following phrase.
    Formatting Instructions:{format_instructions}
    Phrase:{phrase}`);
  const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
    name: "The name of the person ",
    age: "The age of the person",
  });
  const chain = prompt.pipe(model).pipe(outputParser);
  return await chain.invoke({
    phrase: "Raj is old then Simran",
    format_instructions: outputParser.getFormatInstructions(),
  });
}

// structure the output according to zod
async function callZodOuputParser() {
  const prompt = ChatPromptTemplate.fromTemplate(`
    Extract information from following phrase.
    Formatting Instructions:{format_instructions}
    Phrase:{phrase}`);
  const outputParser = StructuredOutputParser.fromZodSchema(
    z.object({
      recipe: z.string().describe("name of the person "),
      ingredients: z.array(z.string().describe("ingredients")),
    })
  );
  const chain = prompt.pipe(model).pipe(outputParser);
  return await chain.invoke({
    phrase:
      "The ingredients for a sev ka salan recipe are tomatos, sev, vegetable",
    format_instructions: outputParser.getFormatInstructions(),
  });
}

// const response = await callStringOutputParser();
// const response = await callListOutputParser();
// const response = await callStructureParse();
const response = await callZodOuputParser();
console.log(response);
