import { test, expect } from "vitest";
import { DictionaryTrie } from "~/db/trie";

test("insert into trie", () => {
  const trie = new DictionaryTrie();
  trie.insert("word");
  expect(trie.search("word")).toBe(true);
});

test("build trie", () => {
  const trie_words = [
    "firstword", "secondword", "thirdword",
    "fourthword", "fifthword", "sixthword",
  ];

  const trie = new DictionaryTrie();
  trie.build(trie_words);

  trie_words.forEach(word => {
    expect(trie.search(word)).toBe(true);
  });
});

test("search trie", () => {
  const trie = new DictionaryTrie();
  trie.insert("word");
  expect(trie.search("word")).toBe(true);
  expect(trie.search("nonexistent")).toBe(false);
});
