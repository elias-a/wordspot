import { test, expect } from "vitest";
import { DictionaryTrie } from "~/db/trie";

test("insert into trie", () => {
  const trie = new DictionaryTrie();
  trie.insert("word");
  expect(trie.search("word")).toBe(true);
});

test("search trie", () => {
  const trie = new DictionaryTrie();
  trie.insert("word");
  expect(trie.search("word")).toBe(true);
  expect(trie.search("nonexistent")).toBe(false);
});
