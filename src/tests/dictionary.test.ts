import { test, expect } from "vitest";
import { createTrie } from "~/db/dictionary";

test("create trie structure from txt file", async () => {
    const trie = await createTrie("data/english_dictionary.txt");
    expect(trie.search("test")).toBe(true);
    expect(trie.search("abcde")).toBe(false);
});
