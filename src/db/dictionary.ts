import fs from "fs";
import readline from "readline";
import { dictionaryTrie } from ".";
import { DictionaryTrie } from "~/db/trie";

export async function isEnglishWord(word: string): Promise<boolean> {
  const trie = await dictionaryTrie;
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
