import fs from "fs";
import readline from "readline";
import { DictionaryTrie } from "~/db/trie";

export async function isEnglishWord(word: string): Promise<boolean> {
  let trie: DictionaryTrie;
  try {
    trie = await dictionaryTrie;
  } catch(error) {
    if (error instanceof Error) {
      throw new Error(`Could not read English dictionary: "${error.message}"`);
    } else {
      throw new Error("Unknown error: Could not read English dictionary.");
    }
  }

  return trie.search(word);
}

export async function createTrie(fileName: string) {
  const fileStream = fs.createReadStream(fileName);

  const readableInterface = readline.createInterface({
    input: fileStream,
  });

  const trie = new DictionaryTrie();
  for await (const line of readableInterface) {
    trie.insert(line);
  }

  return trie;
}

export const dictionaryTrie = createTrie("data/english_dictionary.txt");
